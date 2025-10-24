import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma Client with inline mock instance
vi.mock('@prisma/client', () => {
  const mockProjectMethods = {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn()
  };
  const mockLabelMethods = {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
    groupBy: vi.fn()
  };

  return {
    PrismaClient: function() {
      this.project = mockProjectMethods;
      this.projectLabel = mockLabelMethods;
      this.$disconnect = vi.fn();
      return this;
    },
    // Export the mock methods so tests can access them
    __mockMethods: {
      project: mockProjectMethods,
      projectLabel: mockLabelMethods
    }
  };
});

// Mock CompanyCam API
vi.mock('../netlify/functions/lib/companycam-api.js', () => ({
  fetchProjectLabels: vi.fn()
}));

import { syncProject, getProject, searchProjectsByAddress, getProjectsByLabel, getTenantLabels } from '../netlify/functions/lib/project-sync.js';
import { fetchProjectLabels } from '../netlify/functions/lib/companycam-api.js';
import { PrismaClient, __mockMethods } from '@prisma/client';

// Get references to the mocked methods
const mockProject = __mockMethods.project;
const mockProjectLabel = __mockMethods.projectLabel;

describe('Project Sync', () => {
  const mockTenant = 'budroofing';
  const mockApiToken = 'test-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncProject', () => {
    it('should sync project with labels to database', async () => {
      const mockProjectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'active',
        address: {
          street_address_1: '123 Main St',
          city: 'Kansas City',
          state: 'MO',
          postal_code: '64101'
        },
        photo_count: 5,
        public_url: 'https://example.com/project',
        coordinates: { lat: 39.1, lon: -94.5 }
      };

      const mockLabels = [
        {
          id: 'label-1',
          display_value: 'Door Hanger',
          value: 'door hanger',
          tag_type: 'project'
        }
      ];

      const mockSyncedProject = {
        id: 'proj-123',
        tenant: mockTenant,
        address: '123 Main St',
        labels: [
          {
            id: 'pl-1',
            projectId: 'proj-123',
            labelId: 'label-1',
            displayValue: 'Door Hanger',
            value: 'door hanger',
            tagType: 'project'
          }
        ]
      };

      fetchProjectLabels.mockResolvedValueOnce(mockLabels);
      mockProject.upsert.mockResolvedValueOnce(mockSyncedProject);
      mockProjectLabel.deleteMany.mockResolvedValueOnce({ count: 0 });
      mockProjectLabel.createMany.mockResolvedValueOnce({ count: 1 });
      mockProject.findUnique.mockResolvedValueOnce(mockSyncedProject);

      const result = await syncProject(mockProjectData, mockTenant, mockApiToken);

      expect(fetchProjectLabels).toHaveBeenCalledWith('proj-123', mockApiToken);
      expect(mockProject.upsert).toHaveBeenCalled();
      expect(mockProjectLabel.deleteMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' }
      });
      expect(mockProjectLabel.createMany).toHaveBeenCalled();
      expect(result).toEqual(mockSyncedProject);
    });

    it('should handle projects with no labels', async () => {
      const mockProjectData = {
        id: 'proj-456',
        name: 'Project No Labels',
        address: { street_address_1: '456 Oak Ave' },
        photo_count: 0
      };

      const mockSyncedProject = {
        id: 'proj-456',
        tenant: mockTenant,
        labels: []
      };

      fetchProjectLabels.mockResolvedValueOnce([]);
      mockProject.upsert.mockResolvedValueOnce(mockSyncedProject);
      mockProjectLabel.deleteMany.mockResolvedValueOnce({ count: 0 });
      mockProject.findUnique.mockResolvedValueOnce(mockSyncedProject);

      const result = await syncProject(mockProjectData, mockTenant, mockApiToken);

      expect(result).toEqual(mockSyncedProject);
      expect(mockProjectLabel.createMany).not.toHaveBeenCalled();
    });
  });

  describe('getProject', () => {
    it('should fetch project by ID', async () => {
      const mockProjectData = {
        id: 'proj-123',
        address: '123 Main St',
        labels: [{ displayValue: 'Completed', value: 'completed' }]
      };

      mockProject.findUnique.mockResolvedValueOnce(mockProjectData);

      const result = await getProject('proj-123');

      expect(mockProject.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
        include: { labels: true }
      });
      expect(result).toEqual(mockProjectData);
    });

    it('should return null if project not found', async () => {
      mockProject.findUnique.mockResolvedValueOnce(null);

      const result = await getProject('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('searchProjectsByAddress', () => {
    it('should search projects by address', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          address: '123 Main St',
          tenant: mockTenant,
          labels: []
        }
      ];

      mockProject.findMany.mockResolvedValueOnce(mockProjects);

      const result = await searchProjectsByAddress('123 Main', mockTenant);

      expect(mockProject.findMany).toHaveBeenCalledWith({
        where: {
          tenant: mockTenant,
          address: {
            contains: '123 main',
            mode: 'insensitive'
          }
        },
        include: { labels: true },
        orderBy: { lastSyncedAt: 'desc' }
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getProjectsByLabel', () => {
    it('should get projects by label value', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          address: '123 Main St',
          labels: [{ value: 'door hanger', displayValue: 'Door Hanger' }]
        }
      ];

      mockProject.findMany.mockResolvedValueOnce(mockProjects);

      const result = await getProjectsByLabel('door hanger', mockTenant);

      expect(mockProject.findMany).toHaveBeenCalledWith({
        where: {
          tenant: mockTenant,
          labels: {
            some: {
              value: 'door hanger'
            }
          }
        },
        include: { labels: true },
        orderBy: { lastSyncedAt: 'desc' }
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getTenantLabels', () => {
    it('should get all unique labels with counts', async () => {
      const mockGroupedLabels = [
        {
          value: 'door hanger',
          displayValue: 'Door Hanger',
          _count: { value: 5 }
        },
        {
          value: 'completed',
          displayValue: 'Completed',
          _count: { value: 3 }
        }
      ];

      mockProjectLabel.groupBy.mockResolvedValueOnce(mockGroupedLabels);

      const result = await getTenantLabels(mockTenant);

      expect(result).toEqual([
        { value: 'door hanger', displayValue: 'Door Hanger', projectCount: 5 },
        { value: 'completed', displayValue: 'Completed', projectCount: 3 }
      ]);
    });
  });
});
