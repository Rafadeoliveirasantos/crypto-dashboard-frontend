import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://localhost:7215/api';

  constructor(private http: HttpClient) {}

  // ═════════════════════════════════════════════════════════════
  // CRIPTOMOEDAS
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Busca lista de criptomoedas (top 10)
   * GET /api/cryptos
   */
  getCryptos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos`);
  }

  /**
   * Busca detalhes de uma criptomoeda específica
   * GET /api/cryptos/{id}
   */
  getCryptoDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cryptos/${id}`);
  }

  /**
   * Busca dados históricos de preço
   * GET /api/cryptos/{id}/chart?days=30
   */
  getHistoricalData(id: string, days: number = 30): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cryptos/${id}/chart?days=${days}`);
  }

  // ═════════════════════════════════════════════════════════════
  // FAVORITOS
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Adiciona uma criptomoeda aos favoritos
   * POST /api/cryptos/{id}/favorite
   */
  addFavorite(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cryptos/${id}/favorite`, {});
  }

  /**
   * Remove uma criptomoeda dos favoritos
   * DELETE /api/cryptos/{id}/favorite
   */
  removeFavorite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cryptos/${id}/favorite`);
  }

  /**
   * Busca lista de favoritos
   * GET /api/cryptos/favorites
   */
  getFavorites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/favorites`);
  }

  // ═════════════════════════════════════════════════════════════
  // CONFIGURAÇÕES
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Busca todas as configurações
   * GET /api/settings
   */
  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }

  /**
   * Atualiza configurações
   * PUT /api/settings
   */
  updateSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, settings);
  }

  /**
   * Busca intervalo de atualização (em segundos)
   * GET /api/settings/update-interval
   */
  getUpdateInterval(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/settings/update-interval`);
  }

  // ═════════════════════════════════════════════════════════════
  // EXPORTAÇÃO
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Exporta todas as criptomoedas
   * GET /export/cryptos?type=csv ou json
   */
  exportCryptos(format: 'csv' | 'json' = 'json'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/cryptos?type=${format}`, {
      responseType: 'blob'
    });
  }

  /**
   * Exporta favoritos
   * GET /export/favorites?type=csv ou json
   */
  exportFavorites(format: 'csv' | 'json' = 'json'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/favorites?type=${format}`, {
      responseType: 'blob'
    });
  }

  /**
   * Exporta alertas
   * GET /export/alerts?type=csv ou json
   */
  exportAlerts(format: 'csv' | 'json' = 'json'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/alerts?type=${format}`, {
      responseType: 'blob'
    });
  }

  // ═════════════════════════════════════════════════════════════
  // ALERTAS
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Cria um novo alerta de preço
   * POST /api/cryptos/{id}/alerts
   */
  createAlert(cryptoId: string, targetPrice: number, type: 'min' | 'max' = 'max'): Observable<any> {
    return this.http.post(`${this.apiUrl}/cryptos/${cryptoId}/alerts`, {
      targetPrice,
      type
    });
  }

  /**
   * Lista todos os alertas ativos
   * GET /api/cryptos/alerts
   */
  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/alerts`);
  }

  /**
   * Remove um alerta
   * DELETE /api/cryptos/alerts/{alertId}
   */
  deleteAlert(alertId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cryptos/alerts/${alertId}`);
  }

  /**
   * Busca histórico de alertas disparados
   * GET /api/cryptos/alerts/history
   */
  getAlertHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/alerts/history`);
  }

  // ═════════════════════════════════════════════════════════════
  // ESTATÍSTICAS
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Busca top criptomoedas em alta
   * GET /api/cryptos/stats/top-gainers?count=5
   */
  getTopGainers(count: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/stats/top-gainers?count=${count}`);
  }

  /**
   * Busca top criptomoedas em baixa
   * GET /api/cryptos/stats/top-losers?count=5
   */
  getTopLosers(count: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/stats/top-losers?count=${count}`);
  }

  // ═════════════════════════════════════════════════════════════
  // COMPARAÇÃO
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Compara até 3 criptomoedas
   * GET /api/cryptos/compare?ids=bitcoin,ethereum,cardano
   */
  compareCryptos(ids: string[]): Observable<any[]> {
    if (ids.length === 0 || ids.length > 3) {
      throw new Error('Você deve comparar entre 1 e 3 criptomoedas');
    }
    const idsParam = ids.join(',');
    return this.http.get<any[]>(`${this.apiUrl}/cryptos/compare?ids=${idsParam}`);
  }

  // ═════════════════════════════════════════════════════════════
  // CONVERSÃO
  // ═════════════════════════════════════════════════════════════
  
  /**
   * Converte valores entre moedas
   * GET /api/cryptos/convert?from=BTC&to=USD&amount=1
   */
  convertCurrency(from: string, to: string, amount: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/cryptos/convert?from=${from}&to=${to}&amount=${amount}`
    );
  }

  /**
   * Busca taxas de câmbio
   * GET /api/cryptos/exchange-rates?baseCurrency=USD&symbols=BRL,EUR
   */
  getExchangeRates(baseCurrency: string = 'USD', symbols: string[] = ['BRL']): Observable<any> {
    const symbolsParam = symbols.join(',');
    return this.http.get<any>(
      `${this.apiUrl}/cryptos/exchange-rates?baseCurrency=${baseCurrency}&symbols=${symbolsParam}`
    );
  }
}