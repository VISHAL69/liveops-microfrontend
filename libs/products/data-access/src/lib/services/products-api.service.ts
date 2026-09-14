import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Product,
  ProductCategory,
  ProductsResponse,
} from '@liveops/products-data-access';

const API_BASE = 'https://dummyjson.com';

/**
 * Thin, typed HTTP layer for the Products domain.
 * No UI logic lives here - only API access.
 */
@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  getProducts(limit = 0, skip = 0): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('skip', skip);
    return this.http.get<ProductsResponse>(`${API_BASE}/products`, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_BASE}/products/${id}`);
  }

  searchProducts(query: string): Observable<ProductsResponse> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ProductsResponse>(`${API_BASE}/products/search`, {
      params,
    });
  }

  getProductsByCategory(category: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(
      `${API_BASE}/products/category/${category}`
    );
  }

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${API_BASE}/products/categories`);
  }
}
