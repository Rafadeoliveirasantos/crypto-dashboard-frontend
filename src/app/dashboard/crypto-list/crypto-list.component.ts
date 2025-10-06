import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';

interface Crypto {
  id: string;
  logo: string;
  name: string;
  symbol: string;
  priceUsd: number;
  priceBrl: number;
  change24h: number;
  marketCap: number;
  volume: number;
  lastUpdate: string;
  favorite: boolean;
  trendData: number[];
}

@Component({
  selector: 'app-crypto-list',
  standalone: true,
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
  displayedColumns: string[] = ['logo', 'name', 'price', 'change24h', 'favorite'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCryptos().subscribe(data => {
      this.cryptos = data;
    });
  }
}