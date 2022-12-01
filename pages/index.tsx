import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useProvider,
  useSigner,
  useSwitchNetwork,
} from "wagmi";
import { Biconomy } from "@biconomy/mexa";
import { ExternalProvider } from "@ethersproject/providers";

import abi from "../abis/abi.json";
import { Contract } from "ethers";
import { bsc } from "wagmi/chains";

let biconomy: any;

export default function Home() {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect({
    onError(error: any) {
      let errorMsg = "";

      if (error.message.toString().startsWith("invalid address")) {
        errorMsg =
          "Looks like you are not connected to BSC chain. Please switch the network in the Wallet.";
      }

      alert(errorMsg || error.message);
    },
  });

  const [isBicoReady, setBicoReady] = useState(false);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const isSupportedNetwork = chain && chain.id === bsc.id;

  useEffect(() => {
    if (isConnected && signer && isSupportedNetwork && !isBicoReady) {
      const initBiconomy = async () => {
        // With this I am able to instantiate
        const p = (signer?.provider as any).provider;

        biconomy = new Biconomy(p as ExternalProvider, {
          apiKey: "ys1jfyC_i.d7c361a3-0ffb-4f92-b756-d1479ae5705c",
          debug: true,
          contractAddresses: ["0x3629787a59418732b388ed398928c5bb9f4e74f1"],
        });
        console.log("initiating");

        await biconomy.init();

        console.log("done");
        setBicoReady(true);
      };

      initBiconomy();
    }
  }, [provider, isConnected, signer, isBicoReady, isSupportedNetwork]);

  const signReferralTxn = async () => {
    try {
      const bProvider = await biconomy.provider;

      const contractInstance = new Contract(
        "0x3629787a59418732B388ED398928c5Bb9f4E74f1",
        abi,
        biconomy.ethersProvider
      );

      const { data, to } =
        await contractInstance.populateTransaction.storeUserInfo("manoj");

      const txParams = {
        data: data,
        to: to,
        from: address,
        signatureType: "PERSONAL_SIGN",
      };

      const tx = await bProvider.send("eth_sendTransaction", [txParams]);
      console.log(tx);
      biconomy.on("txHashGenerated", (data: any) => {
        console.log(data);
      });
      biconomy.on("txMined", (data: any) => {
        console.log(data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        padding: "2rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {!isConnected &&
        connectors.map((connector) => (
          <button
            key={connector.id}
            style={{ padding: "1rem" }}
            onClick={() => connect({ connector })}
          >
            {connector.name}
          </button>
        ))}

      {isConnected && <p>Address : {address}</p>}
      {isConnected && !isSupportedNetwork && (
        <button
          onClick={() => switchNetwork?.(bsc.id)}
          style={{ padding: "1rem" }}
        >
          Switch
        </button>
      )}
      {isConnected && isBicoReady && (
        <button onClick={signReferralTxn} style={{ padding: "1rem" }}>
          Sign
        </button>
      )}
      {isConnected && (
        <button onClick={() => disconnect()} style={{ padding: "1rem" }}>
          Disconnect
        </button>
      )}
    </div>
  );
}
