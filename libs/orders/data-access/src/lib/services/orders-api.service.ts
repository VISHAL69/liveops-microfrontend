import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cart, CartsResponse } from '@liveops/orders-data-access';

const API_BASE = 'https://dummyjson.com';

interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
}

interface UsersResponse {
  users: DummyUser[];
}

/**
 * Thin, typed HTTP layer for the Orders domain.
 * DummyJSON "carts" stand in for orders in this demo, as specified.
 */
@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  getCarts(limit = 0, skip = 0): Observable<CartsResponse> {
    const params = new HttpParams().set('limit', limit).set('skip', skip);
    return this.http.get<CartsResponse>(`${API_BASE}/carts`, { params });
  }

  getCartById(id: number): Observable<Cart> {
    return this.http.get<Cart>(`${API_BASE}/carts/${id}`);
  }

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${API_BASE}/users`, {
      params: new HttpParams().set('limit', 0),
    });
  }

  getUserById(id: number): Observable<DummyUser> {
    return this.http.get<DummyUser>(`${API_BASE}/users/${id}`);
  }
}
