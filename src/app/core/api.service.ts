import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://localhost:7215/api';// Troque pela URL da sua API backend

  constructor(private http: HttpClient) {}

  // Buscar lista de criptomoedas
  getCryptos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cryptos`);
  }

  // Buscar detalhes de uma moeda específica
  getCryptoDetail(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/cryptos/${id}`);
  }

  // Atualizar favoritos
  toggleFavorite(id: string, isFavorite: boolean): Observable<any> {
    return isFavorite
      ? this.http.post(`${this.baseUrl}/settings/favorites/${id}`, {})
      : this.http.delete(`${this.baseUrl}/settings/favorites/${id}`);
  }

  // Outros métodos conforme necessidade...
}