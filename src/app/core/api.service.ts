import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7215/api';

  constructor(private http: HttpClient) {}

  // ===== CRIPTOMOEDAS =====
  
  getCryptos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos`);
  }

  getCryptoDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cryptos/${id}`);
  }

  getHistoricalData(id: string, days: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cryptos/${id}/chart?days=${days}`);
  }

  // ===== FAVORITOS =====
  
  addFavorite(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cryptos/${id}/favorite`, {});
  }

  removeFavorite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cryptos/${id}/favorite`);
  }

  getFavorites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/favorites`);
  }

  // ===== CONFIGURAÇÕES - CORRIGIDO =====
  
  // 🆕 Método específico para buscar o intervalo (retorna número)
  getUpdateInterval(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/settings/update-interval`);
  }

  // Método genérico para buscar todas as configurações (retorna objeto)
  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }

  // ===== EXPORTAÇÃO =====
  
  exportFavorites(format: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/favorites?format=${format}`, {
      responseType: 'blob'
    });
  }

  exportAll(format: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/all?format=${format}`, {
      responseType: 'blob'
    });
  }

  // ===== ALERTAS (se implementado) =====
  
  createAlert(cryptoId: string, targetPrice: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cryptos/${cryptoId}/alerts`, {
      targetPrice,
      condition: 'above' // ou 'below'
    });
  }

  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/alerts`);
  }

  deleteAlert(alertId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cryptos/alerts/${alertId}`);
  }

  // ===== ESTATÍSTICAS =====
  
  getTopGainers(count: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/stats/top-gainers?count=${count}`);
  }

  getTopLosers(count: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/stats/top-losers?count=${count}`);
  }

  // ===== COMPARAÇÃO =====
  
  compareCryptos(ids: string[]): Observable<any[]> {
    const idsParam = ids.join(',');
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/compare?ids=${idsParam}`);
  }

  // ===== CONVERSÃO =====
  
  convertCurrency(from: string, to: string, amount: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cryptos/convert?from=${from}&to=${to}&amount=${amount}`);
  }
}