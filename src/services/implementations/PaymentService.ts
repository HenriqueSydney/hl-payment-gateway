import { IPaymentService, PaymentInput } from "../IPaymentService";
import { IFeeStrategy } from "../strategies/fee/IFeeStrategy";
import { DefaultFeeStrategy } from "../strategies/fee/implementations/DefaultFeeStrategy";
import { StripeFeeStrategy } from "../strategies/fee/implementations/StripeFeeStrategy";

interface RateCacheEntry {
  rate: number;
  timestamp: number;
}

export class PaymentService implements IPaymentService {
  private rateCache: Map<string, RateCacheEntry> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000;
  private strategies: Record<string, IFeeStrategy> = {
    STRIPE: new StripeFeeStrategy(),
    DEFAULT: new DefaultFeeStrategy(),
  };

  async convertCurrency({
    amount,
    from,
    to,
  }: PaymentInput): Promise<{ brlAmount: number; exchangeRate: number }> {
    if (from === to) {
      return { brlAmount: amount, exchangeRate: 1 };
    }

    try {     
      const exchangeRate = await this.getExchangeRate(from, to);
      const rawConverted = amount * exchangeRate;
      const brlAmount = Number(rawConverted.toFixed(2));

      return { brlAmount, exchangeRate };
    } catch (error) {
      console.error(`Erro ao converter moeda ${from}->${to}:`, error);      
      throw new Error(
        `Service Unavailable: Cannot convert currency from ${from} to ${to}`
      );
    }
   
  }

  async getFeeAmountAndCalculateNetAmount(data: {
    provider: string;
    grossAmount: number;
    providerTxId?: string;
    providedFee?: number;
  }): Promise<{ feeAmount: number; netAmount: number }> {
    const strategy =
      this.strategies[data.provider] || this.strategies["DEFAULT"];

    return strategy.calculate({
      grossAmount: data.grossAmount,
      providerTxId: data.providerTxId,
      providedFee: data.providedFee,
    });
  }

  private async getExchangeRate(from: string, to: string): Promise<number> {
    const pairKey = `${from}-${to}`;
    const now = Date.now();
  
    const cached = this.rateCache.get(pairKey);
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.rate;
    }

    // Busca na API Externa (AwesomeAPI)
    // Documentação: https://docs.awesomeapi.com.br/api-de-moedas
    const apiPair = `${from}-${to}`;
    const response = await fetch(
      `https://economia.awesomeapi.com.br/last/${apiPair}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate for ${apiPair}`);
    }

    const data = await response.json();
   
    const resultKey = `${from}${to}`; 
    const rateString = data[resultKey]?.bid; 

    if (!rateString) {
      throw new Error(
        `Invalid response format from Exchange API for ${resultKey}`
      );
    }

    const rate = Number(rateString);
   
    this.rateCache.set(pairKey, {
      rate: rate,
      timestamp: now,
    });

    return rate;
  }
}
