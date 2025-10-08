import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { interval, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Interface simplificada (SEM propriedades de gráfico)
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
}

@Component({
  selector: 'app-crypto-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSortModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './crypto-list.component.html',
  styleUrls: ['./crypto-list.component.scss']
})
export class CryptoListComponent implements OnInit, OnDestroy {
  // Dados
  cryptos: Crypto[] = [];
  filteredCryptos: Crypto[] = [];
  
  // Colunas da tabela
  displayedColumns: string[] = [
    'logo', 
    'name', 
    'price', 
    'change24h', 
    'marketCap', 
    'volume', 
    'favorite',
    'actions'
  ];

  // Controles de busca e filtros
  searchControl = new FormControl('');
  filterControl = new FormControl('all');
  
  // Estado
  isLoading = false;
  lastUpdate: Date = new Date();
  
  // Subscriptions
  private subscriptions = new Subscription();
  private autoUpdateSubscription?: Subscription;

  // 🆕 Rastreador de erros de imagem
  private hasImageError = new Set<string>();


  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCryptos();
    this.setupSearch();
    this.setupAutoUpdate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.autoUpdateSubscription?.unsubscribe();
  }

  // ===== CARREGAMENTO DE DADOS =====

  loadCryptos(): void {
    this.isLoading = true;
    
    console.log('📡 Carregando criptomoedas...');
    
    this.apiService.getCryptos().subscribe({
      next: (data) => {
        console.log('✅ Dados recebidos:', data);
        this.cryptos = data || [];
        this.applyFilters();
        this.lastUpdate = new Date();
        this.isLoading = false;
        
        console.log(`✅ ${this.cryptos.length} criptomoedas carregadas`);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar criptomoedas:', error);
        this.isLoading = false;
        this.cryptos = [];
        this.applyFilters();
      }
    });
  }

  // ===== BUSCA E FILTROS =====

  setupSearch(): void {
    const searchSub = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFilters();
      });

    const filterSub = this.filterControl.valueChanges
      .subscribe(() => {
        this.applyFilters();
      });

    this.subscriptions.add(searchSub);
    this.subscriptions.add(filterSub);
  }

  applyFilters(): void {
    let filtered = [...this.cryptos];

    // Filtro de busca (nome ou símbolo)
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm) ||
        crypto.symbol.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de variação e favoritos
    const filterValue = this.filterControl.value;
    switch (filterValue) {
      case 'positive':
        filtered = filtered.filter(crypto => crypto.variation24h > 0);
        break;
      case 'negative':
        filtered = filtered.filter(crypto => crypto.variation24h < 0);
        break;
      case 'favorites':
        filtered = filtered.filter(crypto => crypto.isFavorite);
        break;
    }

    this.filteredCryptos = filtered;
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.filterControl.setValue('all');
  }

  // ===== ATUALIZAÇÃO AUTOMÁTICA =====

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
          this.cryptos = data || [];
          this.applyFilters();
          this.lastUpdate = new Date();
          console.log('✅ Dados atualizados automaticamente');
        },
        error: (error) => {
          console.error('❌ Erro na atualização automática:', error);
        }
      });
  }

  refreshData(): void {
    console.log('🔄 Atualização manual solicitada');
    this.loadCryptos();
  }

  // ===== FAVORITOS =====

  toggleFavorite(crypto: Crypto): void {
    const previousState = crypto.isFavorite;
    crypto.isFavorite = !crypto.isFavorite;
    
    console.log(`⭐ ${crypto.isFavorite ? 'Adicionando' : 'Removendo'} favorito: ${crypto.name}`);
    
    this.cryptos = [...this.cryptos];
    this.applyFilters();

    const request = crypto.isFavorite 
      ? this.apiService.addFavorite(crypto.id)
      : this.apiService.removeFavorite(crypto.id);

    request.subscribe({
      next: () => {
        console.log(`✅ Favorito ${crypto.isFavorite ? 'adicionado' : 'removido'}: ${crypto.name}`);
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar favorito:', error);
        crypto.isFavorite = previousState;
        this.cryptos = [...this.cryptos];
        this.applyFilters();
      }
    });
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

  // ===== AÇÕES DO MENU =====

  onRowClick(crypto: Crypto): void {
    console.log('🖱️ Linha clicada:', crypto.name);
    this.viewDetails(crypto);
  }

  viewDetails(crypto: Crypto): void {
    console.log('🔍 Ver detalhes de:', crypto.name);
    alert(`Ver detalhes de ${crypto.name}\n\nImplementar dialog ou navegação aqui!`);
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
      // TODO: Chamar API para criar alerta
    }
  }

  compareWithOthers(crypto: Crypto): void {
    console.log('🔄 Comparar:', crypto.name);
    alert(`Comparar ${crypto.name} com outras criptomoedas\n\nImplementar comparação aqui!`);
  }

  // ===== TRATAMENTO DE ERRO DE IMAGEM =====
  
  onImageError(event: any): void {
    const cryptoSymbol = event.target.alt || '?';
    const cryptoId = cryptoSymbol.toLowerCase();
    
    // Só loga uma vez por crypto
    if (!this.hasImageError.has(cryptoId)) {
      console.warn(`⚠️ Imagem não disponível para: ${cryptoSymbol}`);
      this.hasImageError.add(cryptoId);
    }
    
    // Previne loop infinito
    if (event.target.src.includes('data:image')) {
      return;
    }
    
    // Pega a primeira letra do símbolo
    const initial = cryptoSymbol.charAt(0).toUpperCase();
    
    // Define cores baseadas na primeira letra
    const getColor = (letter: string) => {
      const charCode = letter.charCodeAt(0);
      if (charCode >= 65 && charCode <= 69) return { bg: '%234f46e5', fg: 'white' }; // A-E: Azul
      if (charCode >= 70 && charCode <= 74) return { bg: '%2306b6d4', fg: 'white' }; // F-J: Ciano
      if (charCode >= 75 && charCode <= 79) return { bg: '%2310b981', fg: 'white' }; // K-O: Verde
      if (charCode >= 80 && charCode <= 84) return { bg: '%23f59e0b', fg: 'white' }; // P-T: Laranja
      return { bg: '%23ef4444', fg: 'white' }; // U-Z: Vermelho
    };
    
    const color = getColor(initial);
    
    // Cria SVG com inicial e cor personalizada
    const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='${color.bg}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.35em' fill='${color.fg}' font-size='16' font-weight='bold' font-family='Arial, sans-serif'%3E${initial}%3C/text%3E%3C/svg%3E`;
    
    event.target.src = placeholderSvg;
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