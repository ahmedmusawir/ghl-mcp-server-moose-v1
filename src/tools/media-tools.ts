/**
 * GoHighLevel Media Library Tools
 * Implements media file management functionality
 * 
 * IMPORTANT: Follows lessons learned from calendar-tools fix:
 * - Always use this.ghlClient.getConfig().locationId as fallback (never empty string)
 * - Return response.data (unwrapped) not response
 * - Comprehensive error handling for all HTTP codes
 */

import { z } from "zod";
import { GHLApiClient } from '../clients/ghl-api-client.js';

/**
 * MediaTools class for GoHighLevel Media Library API endpoints
 * Handles file management operations including listing, uploading, and deleting files/folders
 */
export class MediaTools {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Get all available Media Library tool definitions
   */
  getToolDefinitions(): any[] {
    return [
      {
        name: 'get_media_files',
        description: `Get list of files and folders from the media library.

Search and filter media with pagination and sorting.

Use Cases:
- Browse media library
- Search for specific files
- List files in a folder
- Filter by file type

Returns: Array of files/folders with URLs, sizes, and metadata.

Related Tools: upload_media_file, delete_media_file`,
        inputSchema: {
          offset: z.number().min(0).optional().describe('Number of files to skip (default: 0)'),
          limit: z.number().min(1).max(100).optional().describe('Number of files to return (max 100, default: 20)'),
          sortBy: z.string().optional().describe('Field to sort by (createdAt, name, size)'),
          sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort direction (default: desc)'),
          type: z.enum(['file', 'folder']).optional().describe('Filter by type'),
          query: z.string().optional().describe('Search query to filter files by name'),
          altType: z.enum(['location', 'agency']).optional().describe('Context type (default: location)'),
          altId: z.string().optional().describe('Location or Agency ID (uses default if not provided)'),
          parentId: z.string().optional().describe('Parent folder ID to list files within')
        }
      },
      {
        name: 'upload_media_file',
        description: `Upload a file to the media library or add a hosted file URL.

⚠️ Max file size: 25MB for direct uploads

Two upload modes:
1. Direct upload: Provide file data
2. Hosted URL: Provide fileUrl (set hosted=true)

Use Cases:
- Upload images for social posts
- Store documents
- Add hosted files by URL
- Organize files in folders

Returns: Uploaded file with URL and metadata.

Related Tools: get_media_files, delete_media_file`,
        inputSchema: {
          file: z.string().optional().describe('File data (binary) for direct upload'),
          hosted: z.boolean().optional().describe('Set to true if providing a fileUrl (default: false)'),
          fileUrl: z.string().optional().describe('URL of hosted file (required if hosted=true)'),
          name: z.string().optional().describe('Custom name for the uploaded file'),
          parentId: z.string().optional().describe('Parent folder ID to upload into'),
          altType: z.enum(['location', 'agency']).optional().describe('Context type (default: location)'),
          altId: z.string().optional().describe('Location or Agency ID (uses default if not provided)')
        }
      },
      {
        name: 'delete_media_file',
        description: `Delete a specific file or folder from the media library.

⚠️ WARNING: This is permanent and cannot be undone!
⚠️ Deleting a folder deletes all files inside it!

Related Tools: get_media_files, upload_media_file`,
        inputSchema: {
          id: z.string().describe('ID of the file or folder to delete'),
          altType: z.enum(['location', 'agency']).optional().describe('Context type (default: location)'),
          altId: z.string().optional().describe('Location or Agency ID (uses default if not provided)')
        }
      }
    ];
  }

  /**
   * Execute a media tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_media_files':
        return await this.getMediaFiles(args);
      
      case 'upload_media_file':
        return await this.uploadMediaFile(args);
      
      case 'delete_media_file':
        return await this.deleteMediaFile(args);
      
      default:
        throw new Error(`Unknown media tool: ${name}`);
    }
  }

  /**
   * GET MEDIA FILES
   */
  private async getMediaFiles(params: any = {}): Promise<{ success: boolean; files: any[]; total?: number; message: string }> {
    try {
      const requestParams: any = {
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
        altType: params.altType || 'location',
        altId: params.altId || this.ghlClient.getConfig().locationId,
        ...(params.offset !== undefined && { offset: params.offset }),
        ...(params.limit !== undefined && { limit: params.limit }),
        ...(params.type && { type: params.type }),
        ...(params.query && { query: params.query }),
        ...(params.parentId && { parentId: params.parentId })
      };

      const response = await this.ghlClient.getMediaFiles(requestParams);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const files = Array.isArray(response.data.files) ? response.data.files : [];
      
      return {
        success: true,
        files,
        total: response.data.total,
        message: `Retrieved ${files.length} media files/folders`
      };
    } catch (error) {
      throw new Error(`Failed to get media files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPLOAD MEDIA FILE
   */
  private async uploadMediaFile(params: any): Promise<{ success: boolean; fileId: string; url?: string; message: string }> {
    try {
      // Validate upload parameters
      if (params.hosted && !params.fileUrl) {
        throw new Error('fileUrl is required when hosted=true');
      }
      if (!params.hosted && !params.file) {
        throw new Error('file is required when hosted=false or not specified');
      }

      const uploadData: any = {
        altType: params.altType || 'location',
        altId: params.altId || this.ghlClient.getConfig().locationId,
        ...(params.hosted !== undefined && { hosted: params.hosted }),
        ...(params.fileUrl && { fileUrl: params.fileUrl }),
        ...(params.file && { file: params.file }),
        ...(params.name && { name: params.name }),
        ...(params.parentId && { parentId: params.parentId })
      };

      const response = await this.ghlClient.uploadMediaFile(uploadData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        fileId: response.data.fileId,
        url: response.data.url,
        message: `File uploaded successfully with ID: ${response.data.fileId}`
      };
    } catch (error) {
      throw new Error(`Failed to upload media file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE MEDIA FILE
   */
  private async deleteMediaFile(params: any): Promise<{ success: boolean; message: string }> {
    try {
      const deleteParams: any = {
        id: params.id,
        altType: params.altType || 'location',
        altId: params.altId || this.ghlClient.getConfig().locationId
      };

      const response = await this.ghlClient.deleteMediaFile(deleteParams);
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: `Media file/folder deleted successfully`
      };
    } catch (error) {
      throw new Error(`Failed to delete media file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 