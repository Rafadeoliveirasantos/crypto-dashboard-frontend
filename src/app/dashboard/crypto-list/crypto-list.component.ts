import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { ApiService } from '../../core/api.service';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Interface com propriedade trend7d para gráficos
interface Crypto {
  id: string;
  logo: string;
  name: string;
  symbol: string;
  priceUsd: number;
  priceBrl: number;
  variation24h: number;
  marketCap: number;
  volume: number;
  lastUpdate: string;
  isFavorite: boolean;
  trend7d?: number[];
  trend7d?: number[];
}

@Component({
  selector: 'app-crypto-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FormsModule,
    MiniChartComponent
    ReactiveFormsModule,
    MiniChartComponent
  ],
  templateUrl: './crypto-list.component.html',
  styleUrls: ['./crypto-list.component.scss']
})
export class CryptoListComponent implements OnInit, OnDestroy {
  cryptos: Crypto[] = [];
  filteredCryptos: Crypto[] = [];
  
  // Colunas da tabela (incluindo trend)
  displayedColumns: string[] = [
    'logo', 
    'name', 
    'price', 
    'change24h', 
    'trend',
    'change24h',
    'trend',
    'marketCap', 
    'volume', 
    'favorite', 
    'actions'
  ];

  isLoading = false;
  searchTerm = '';
  filterVariation = 'all';
  showFavoritesOnly = false;
  
  private destroy$ = new Subject<void>();
  // Subscriptions
  private subscriptions = new Subscription();
  private autoUpdateSubscription?: Subscription;

  // Rastreador de erros de imagem
  private hasImageError = new Set<string>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCryptos();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== CARREGAMENTO DE DADOS =====

  loadCryptos(): void {
    this.isLoading = true;

    this.apiService.getCryptos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('📊 Dados recebidos da API:', data);
          
          this.cryptos = data.map((crypto: any) => {
            const trend = crypto.trend7d 
              || crypto.sparkline_in_7d?.price 
              || crypto.sparklineIn7d?.price
              || this.generateMockTrend(crypto.variation24h);
            
            return {
              id: crypto.id,
              logo: crypto.imageUrl || crypto.logo || crypto.image,
              name: crypto.name,
              symbol: crypto.symbol,
              priceUsd: crypto.priceUsd,
              priceBrl: crypto.priceBrl,
              variation24h: crypto.variation24h,
              marketCap: crypto.marketCap,
              volume: crypto.volume24h || crypto.volume,
              lastUpdate: crypto.lastUpdated || crypto.lastUpdate,
              isFavorite: crypto.isFavorite || false,
              trend7d: trend
            };
          });
          
          console.log('✅ Primeiro crypto mapeado:', this.cryptos[0]);
          console.log('✅ Trend7d do primeiro:', this.cryptos[0]?.trend7d);
          
          this.filteredCryptos = [...this.cryptos];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar criptomoedas:', error);
          this.isLoading = false;
        }
      });
    
    console.log('📡 Carregando criptomoedas...');
    
    this.apiService.getCryptos().subscribe({
      next: (data) => {
        console.log('✅ Dados recebidos:', data);
        
        // Mapeia dados incluindo trend7d
        this.cryptos = (data || []).map((crypto: any) => {
          const trend = crypto.trend7d 
            || crypto.sparkline_in_7d?.price 
            || crypto.sparklineIn7d?.price
            || this.generateMockTrend(crypto.variation24h || 0);
          
          return {
            id: crypto.id,
            logo: crypto.imageUrl || crypto.logo || crypto.image,
            name: crypto.name,
            symbol: crypto.symbol,
            priceUsd: crypto.priceUsd,
            priceBrl: crypto.priceBrl,
            variation24h: crypto.variation24h || 0,
            marketCap: crypto.marketCap,
            volume: crypto.volume24h || crypto.volume,
            lastUpdate: crypto.lastUpdated || crypto.lastUpdate || new Date().toISOString(),
            isFavorite: crypto.isFavorite || false,
            trend7d: trend
          };
        });
        
        this.applyFilters();
        this.lastUpdate = new Date();
        this.isLoading = false;
        
        console.log(`✅ ${this.cryptos.length} criptomoedas carregadas com gráficos`);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar criptomoedas:', error);
        this.isLoading = false;
        this.cryptos = [];
        this.applyFilters();
      }
    });
  }

  // ===== GERAÇÃO DE DADOS MOCK PARA TREND =====

  private generateMockTrend(variation: number): number[] {
    const points = 7;
    const baseValue = 100;
    const trend: number[] = [baseValue];
    const direction = variation >= 0 ? 1 : -1;
    const volatility = Math.abs(variation) / 10;
    
    for (let i = 1; i < points; i++) {
      const randomChange = (Math.random() - 0.5) * volatility * 2;
      const newValue = trend[i - 1] + (direction * volatility) + randomChange;
      trend.push(Math.max(newValue, baseValue * 0.8));
    }
    
    return trend;
  }

  private generateMockTrend(variation: number): number[] {
    const points = 7;
    const baseValue = 100;
    const trend: number[] = [baseValue];
    const direction = variation >= 0 ? 1 : -1;
    const volatility = Math.abs(variation) / 10;
    
    for (let i = 1; i < points; i++) {
      const randomChange = (Math.random() - 0.5) * volatility * 2;
      const newValue = trend[i - 1] + (direction * volatility) + randomChange;
      trend.push(Math.max(newValue, baseValue * 0.8));
    }
    
    return trend;
  }

  // ===== ATUALIZAÇÃO AUTOMÁTICA =====

  private startAutoRefresh(): void {
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('🔄 Auto-refresh...');
        this.loadCryptos();
  setupAutoUpdate(): void {
    this.apiService.getUpdateInterval().subscribe({
      next: (intervalSeconds) => {
        console.log(`⏱️ Intervalo de atualização: ${intervalSeconds}s`);
        this.startAutoUpdate(intervalSeconds);
      },
      error: (error) => {
        console.warn('⚠️ Erro ao buscar intervalo, usando 300s:', error);
        this.startAutoUpdate(300);
      }
    });
  }

  startAutoUpdate(seconds: number): void {
    console.log(`🔄 Auto-update configurado para ${seconds}s`);
    
    this.autoUpdateSubscription = interval(seconds * 1000)
      .pipe(
        switchMap(() => {
          console.log('🔄 Atualizando automaticamente...');
          return this.apiService.getCryptos();
        })
      )
      .subscribe({
        next: (data) => {
          this.cryptos = (data || []).map((crypto: any) => {
            const trend = crypto.trend7d 
              || crypto.sparkline_in_7d?.price 
              || crypto.sparklineIn7d?.price
              || this.generateMockTrend(crypto.variation24h || 0);
            
            return {
              id: crypto.id,
              logo: crypto.imageUrl || crypto.logo || crypto.image,
              name: crypto.name,
              symbol: crypto.symbol,
              priceUsd: crypto.priceUsd,
              priceBrl: crypto.priceBrl,
              variation24h: crypto.variation24h || 0,
              marketCap: crypto.marketCap,
              volume: crypto.volume24h || crypto.volume,
              lastUpdate: crypto.lastUpdated || crypto.lastUpdate || new Date().toISOString(),
              isFavorite: crypto.isFavorite || false,
              trend7d: trend
            };
          });
          this.applyFilters();
          this.lastUpdate = new Date();
          console.log('✅ Dados atualizados automaticamente');
        },
        error: (error) => {
          console.error('❌ Erro na atualização automática:', error);
        }
      });
  }

  refresh(): void {
    console.log('🔄 Refresh manual');
    this.loadCryptos();
  }

  // ===== FILTROS =====

  applyFilters(): void {
    this.filteredCryptos = this.cryptos.filter(crypto => {
      const matchesSearch = this.searchTerm === '' || 
        crypto.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesVariation = 
        this.filterVariation === 'all' ||
        (this.filterVariation === 'positive' && crypto.variation24h > 0) ||
        (this.filterVariation === 'negative' && crypto.variation24h < 0);
      
      const matchesFavorites = !this.showFavoritesOnly || crypto.isFavorite;
      
      return matchesSearch && matchesVariation && matchesFavorites;
    });

    console.log(`📊 Filtros aplicados: ${this.filteredCryptos.length} de ${this.cryptos.length}`);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterVariation = 'all';
    this.showFavoritesOnly = false;
    this.applyFilters();
  }

  // ===== FAVORITOS =====

  toggleFavorite(crypto: Crypto): void {
    const previousState = crypto.isFavorite;
    crypto.isFavorite = !crypto.isFavorite;
    this.cryptos = [...this.cryptos];

    const request = crypto.isFavorite 
      ? this.apiService.addFavorite(crypto.id)
      : this.apiService.removeFavorite(crypto.id);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log(`⭐ Favorito ${crypto.isFavorite ? 'adicionado' : 'removido'}:`, crypto.name);
        this.applyFilters();
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar favorito:', error);
        crypto.isFavorite = previousState;
        this.cryptos = [...this.cryptos];
        this.applyFilters();
      }
    });
  }

  // ===== AÇÕES DO MENU =====

  viewDetails(crypto: Crypto): void {
    console.log('🔍 Ver detalhes de:', crypto.name);
    console.log('📝 TODO: Implementar navegação para /coin-detail/' + crypto.id);
  }

  createAlert(crypto: Crypto): void {
    console.log('🔔 Criar alerta para:', crypto.name);
    const targetPrice = prompt(
      `Criar alerta de preço para ${crypto.name}\n\n` +
      `Preço atual: $${crypto.priceUsd.toFixed(2)}\n\n` +
      `Digite o preço alvo:`
    );
    
    if (targetPrice) {
      console.log(`Alerta criado: ${crypto.name} @ $${targetPrice}`);
    }
  }

  compareWithOthers(crypto: Crypto): void {
    console.log('🔄 Comparar:', crypto.name);
    console.log('📝 TODO: Implementar comparação de criptomoedas');
  }

  // ===== EXPORTAÇÃO ===== ✅ ADICIONADO AQUI

  exportAll(format: 'csv' | 'json' = 'json'): void {
    console.log(`📥 Exportando todas as criptomoedas como ${format.toUpperCase()}`);
    
    if (this.cryptos.length === 0) {
      alert('Não há dados para exportar!');
      return;
    }

    // TODO: Implementar chamada real à API quando estiver pronto
    // this.apiService.exportCryptos(format).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (blob) => {
    //     this.downloadFile(blob, `cryptos-${Date.now()}.${format}`);
    //     console.log('✅ Exportação concluída!');
    //   },
    //   error: (error) => {
    //     console.error('❌ Erro ao exportar:', error);
    //     alert('Erro ao exportar dados.');
    //   }
    // });

    // ✅ Implementação temporária (mock)
    alert(`Exportar ${this.cryptos.length} criptomoedas como ${format.toUpperCase()}\n\nTODO: Implementar chamada ao endpoint /export/cryptos`);
  }

  exportFavorites(format: 'csv' | 'json' = 'json'): void {
    console.log(`📥 Exportando favoritos como ${format.toUpperCase()}`);
    
    const favorites = this.cryptos.filter(c => c.isFavorite);
    
    if (favorites.length === 0) {
      alert('Você não tem favoritos para exportar!');
      return;
    }

    // TODO: Implementar chamada real à API
    // this.apiService.exportFavorites(format).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (blob) => {
    //     this.downloadFile(blob, `favorites-${Date.now()}.${format}`);
    //     console.log('✅ Exportação de favoritos concluída!');
    //   },
    //   error: (error) => {
    //     console.error('❌ Erro ao exportar favoritos:', error);
    //     alert('Erro ao exportar favoritos.');
    //   }
    // });

    alert(`Exportar ${favorites.length} favoritos como ${format.toUpperCase()}\n\nTODO: Implementar chamada ao endpoint /export/favorites`);
  }

  private downloadFile(data: Blob | string, filename: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ===== ORDENAÇÃO =====

  sortBy(column: string): void {
    this.filteredCryptos.sort((a, b) => {
      switch (column) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.priceUsd - a.priceUsd;
        case 'change24h':
          return b.variation24h - a.variation24h;
        case 'marketCap':
          return b.marketCap - a.marketCap;
        case 'volume':
          return b.volume - a.volume;
        default:
          return 0;
      }
    });
    
    console.log(`📊 Ordenado por: ${column}`);
  }

  // ===== ESTATÍSTICAS =====

  getPositiveCount(): number {
    return this.cryptos.filter(c => c.variation24h > 0).length;
  }

  getNegativeCount(): number {
    return this.cryptos.filter(c => c.variation24h < 0).length;
  }

  getFavoritesCount(): number {
    return this.cryptos.filter(c => c.isFavorite).length;
  }

  // ===== TRATAMENTO DE ERRO DE IMAGEM =====
  
  onImageError(event: any): void {
    const cryptoSymbol = event.target.alt || '?';
    const cryptoId = cryptoSymbol.toLowerCase();
    
    if (!this.hasImageError.has(cryptoId)) {
      console.warn(`⚠️ Imagem não disponível para: ${cryptoSymbol}`);
      this.hasImageError.add(cryptoId);
    }
    
    if (event.target.src.includes('data:image')) {
      return;
    }
    
    const initial = cryptoSymbol.charAt(0).toUpperCase();
    const getColor = (letter: string) => {
      const charCode = letter.charCodeAt(0);
      const hue = (charCode * 7) % 360;
      return `hsl(${hue}, 70%, 60%)`;
      const hue = (charCode * 7) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    };
    
    const color = getColor(initial);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="${color}" rx="16"/>
        <text x="16" y="21" font-family="Arial" font-size="16" font-weight="bold" 
              fill="white" text-anchor="middle">${initial}</text>
      </svg>
    `;
    
    event.target.src = 'data:image/svg+xml;base64,' + btoa(svg);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="${color}" rx="16"/>
        <text x="16" y="21" font-family="Arial" font-size="16" font-weight="bold" 
              fill="white" text-anchor="middle">${initial}</text>
      </svg>
    `;
    
    event.target.src = 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // ===== EXPORTAÇÃO =====

  exportFavorites(): void {
    console.log('📥 Exportando favoritos...');
    
    if (this.getFavoritesCount() === 0) {
      alert('Você não tem favoritos para exportar!');
      return;
    }
    
    this.apiService.exportFavorites('csv').subscribe({
      next: (blob) => {
        this.downloadFile(blob, `favoritos_${this.getDateString()}.csv`);
        console.log('✅ Favoritos exportados');
      },
      error: (error) => {
        console.error('❌ Erro ao exportar favoritos:', error);
        alert('Erro ao exportar favoritos. Verifique o console.');
      }
    });
  }

  exportAll(): void {
    console.log('📥 Exportando todas as criptomoedas...');
    
    this.apiService.exportAll('csv').subscribe({
      next: (blob) => {
        this.downloadFile(blob, `criptomoedas_${this.getDateString()}.csv`);
        console.log('✅ Todas as cryptos exportadas');
      },
      error: (error) => {
        console.error('❌ Erro ao exportar dados:', error);
        alert('Erro ao exportar dados. Verifique o console.');
      }
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}