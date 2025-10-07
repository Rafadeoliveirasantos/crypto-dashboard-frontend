import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';

// A interface sem a propriedade do gráfico
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
  // Remova as importações de gráficos daqui
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './crypto-list.component.html',
  styleUrls: ['./crypto-list.component.scss']
})
export class CryptoListComponent implements OnInit {
  cryptos: Crypto[] = [];
  // A lista de colunas sem 'trend'
  displayedColumns: string[] = ['logo', 'name', 'price', 'change24h', 'favorite'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCryptos().subscribe(data => {
      this.cryptos = data;
    });
  }
  
  toggleFavorite(crypto: Crypto): void {
    // 1. Atualiza o estado no objeto
    crypto.isFavorite = !crypto.isFavorite;

    // 2. Força a atualização da tabela (isso resolveu o problema da estrela)
    this.cryptos = [...this.cryptos];

    // 3. Chama a API correspondente
    const request = crypto.isFavorite 
      ? this.apiService.addFavorite(crypto.id)
      : this.apiService.removeFavorite(crypto.id);

    // 4. Se a API der erro, desfaz a mudança na tela
    request.subscribe({
      error: () => {
        console.error('Falha ao atualizar favorito.');
        crypto.isFavorite = !crypto.isFavorite; // Reverte a mudança
        this.cryptos = [...this.cryptos]; // Atualiza a tabela novamente
      }
    });
  }
}