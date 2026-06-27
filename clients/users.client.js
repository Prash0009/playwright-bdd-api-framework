import { BaseClient } from './base.client.js';

/**
 * UsersClient — service layer for the reqres.in /users resource.
 * Each method maps to a single API operation and returns the normalised
 * result object produced by BaseClient.
 */
export class UsersClient extends BaseClient {
  static RESOURCE = '/users';

  /** GET /api/users?page=n  -> paginated list */
  listUsers(page = 1) {
    return this.get(UsersClient.RESOURCE, { params: { page } });
  }

  /** GET /api/users/:id  -> single user */
  getUser(id) {
    return this.get(`${UsersClient.RESOURCE}/${id}`);
  }

  /** POST /api/users  -> create */
  createUser(payload) {
    return this.post(UsersClient.RESOURCE, { data: payload });
  }

  /** PUT /api/users/:id  -> full update */
  updateUser(id, payload) {
    return this.put(`${UsersClient.RESOURCE}/${id}`, { data: payload });
  }

  /** DELETE /api/users/:id */
  deleteUser(id) {
    return this.delete(`${UsersClient.RESOURCE}/${id}`);
  }
}

export default UsersClient;
