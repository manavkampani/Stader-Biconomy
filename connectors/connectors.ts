import { Chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export type InjectedConnectorOptions = {
  name?: string | ((detectedName: string | string[]) => string);
  shimDisconnect?: boolean;
};

export type ConnectorOptions = Pick<InjectedConnectorOptions, "shimDisconnect">;

export class BinanceWalletConnector extends InjectedConnector {
  readonly id = "binance";
  readonly ready =
    typeof window != "undefined" && !!this.#findProvider(window.BinanceChain);

  #provider?: Window["BinanceChain"];

  constructor(config?: { chains?: Chain[]; options?: ConnectorOptions }) {
    super({
      ...config,
      options: {
        name: "Binance Wallet",
        shimDisconnect: true,
        ...config?.options,
      },
    });
  }

  async getProvider() {
    if (typeof window !== "undefined") {
      // TODO: Fallback to ethereum#initialized event for async injection
      // https://github.com/MetaMask/detect-provider#synchronous-and-asynchronous-injection=
      this.#provider = this.#findProvider(window.BinanceChain);
    }
    return this.#provider;
  }

  #getReady(binance?: any) {
    if (!binance) return;

    return binance;
  }

  #findProvider(binance?: any) {
    if (binance?.providers) return binance.providers.find(this.#getReady);
    return this.#getReady(binance);
  }
}

export class SafePalWalletConnector extends InjectedConnector {
  readonly id = "safepal";
  readonly ready =
    typeof window != "undefined" &&
    !!this.#findProvider(window.safepalProvider);

  #provider?: Window["safepalProvider"];

  constructor(config?: { chains?: Chain[]; options?: ConnectorOptions }) {
    super({
      ...config,
      options: {
        name: "SafePal Wallet",
        shimDisconnect: true,
        ...config?.options,
      },
    });
  }

  async getProvider() {
    if (typeof window !== "undefined") {
      this.#provider = this.#findProvider(window.safepalProvider);
    }
    return this.#provider;
  }

  #getReady(safepal?: any) {
    if (!safepal) return;

    return safepal;
  }

  #findProvider(safepal?: any) {
    if (safepal?.providers) return safepal.providers.find(this.#getReady);
    return this.#getReady(safepal);
  }
}
