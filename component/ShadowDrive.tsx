import React, { useCallback, useEffect } from 'react';
import { ShdwDrive } from '@shadow-drive/sdk';
import * as solana from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import profile from '../data/profile.json';
import { Button } from '@nextui-org/react';
import { getOrca, OrcaPoolConfig } from '@orca-so/sdk';
import Decimal from 'decimal.js';
import toast from 'react-hot-toast';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export default function UploadToShadowDrive(props: any) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [storageAccount, setStorageAccount] =
    React.useState<solana.PublicKey | null>(null);
  const [file, setFile] = React.useState<any>();

  const metadata = {
    name: 'ShadowDrive',
    description: 'A decentralized file storage system built on Solana'
  };

  const SHDW = new PublicKey('SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y');

  // Check if the user has enough SHDW token in their wallet to pay for the storage fee
  const checkSHDWBalance = useCallback(async () => {
    if (!wallet?.publicKey) return;

    const response = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    // Check if the user has SOl in their wallet
    const solBalance = await connection.getBalance(wallet?.publicKey);
    console.log('solBalance', solBalance);
    if (solBalance < 0.1) {
      toast.error('Not enough SOL in your wallet');
      return undefined;
    }

    // Get the amount of SHDW token in the user's wallet
    const shdwToken = response.value.find(
      (account) => account.account.data.parsed.info.mint === SHDW.toBase58()
    );
    const shdwTokenBalance =
      shdwToken?.account.data.parsed.info.tokenAmount.uiAmountString || 0;
    return shdwTokenBalance;
  }, [wallet]);

  // Buy some SHDW token
  const getSHDWToken = useCallback(
    async (shdwTokenBalance: Number | undefined) => {
      if (!wallet?.publicKey) return;

      if (shdwTokenBalance == undefined || shdwTokenBalance < 2) {
        const orca = getOrca(connection);
        const orcaSolPool = orca.getPool(OrcaPoolConfig.SHDW_SOL);
        // For now we will be buying 2 SHDW token as 2 SHDW is enough to have 500KB of storage
        const shdwNeeded = 2;
        const solToken = orcaSolPool.getTokenB();

        // Check how much SHDW for 1 SOL
        const checkSolAmount = new Decimal(1);
        const checkQuote = await orcaSolPool.getQuote(solToken, checkSolAmount);
        const checkShdwAmount = checkQuote.getMinOutputAmount();
        const checkShdwAmountNumber = checkShdwAmount.toNumber();

        // Buying SHDW token
        const solAmount = new Decimal(
          (checkSolAmount.toNumber() / checkShdwAmountNumber) * shdwNeeded
        );
        const quote = await orcaSolPool.getQuote(solToken, solAmount);
        const shdwAmount = quote.getMinOutputAmount();

        const swapPayload = await orcaSolPool.swap(
          wallet.publicKey,
          solToken,
          solAmount,
          shdwAmount
        );
        const tx = wallet.sendTransaction(swapPayload.transaction, connection, {
          signers: swapPayload.signers,
          skipPreflight: true
        });
        toast.promise(tx, {
          loading: `You need to buy ${shdwNeeded} SHDW token to store your file`,
          success: 'Swap successful',
          error: 'Swap failed'
        });
        console.log('Swapped:', tx, '\n');
      }
    },
    [wallet, connection]
  );

  // Initialize the shadow drive storage account
  const initialiseStorageAccount = useCallback(async () => {
    const shdwDrive = await new ShdwDrive(connection, wallet).init();

    if (!shdwDrive) return;

    // Check if the storage account exists
    const storageAccountExists = await shdwDrive?.getStorageAccounts('v2');
    console.log('Storage Account Exists:', storageAccountExists, '\n');
    if (storageAccountExists && storageAccountExists.length > 0) {
      // Iterate through the storage accounts and find the one that matches the storage account key
      for (let i = 0; i < storageAccountExists.length; i++) {
        if (storageAccountExists[i].account.identifier === 'profile') {
          setStorageAccount(storageAccountExists[i].publicKey);
        }
      }
    } else {
      // Check if the user has enough SHDW token in their wallet to pay for the storage fee
      const shdwTokenBalance = (await checkSHDWBalance()) as Number | undefined;
      if (shdwTokenBalance == undefined) return;
      if (shdwTokenBalance < 2) {
        // Buy some SHDW token
        await getSHDWToken(shdwTokenBalance);
      }

      // Create a new storage account
      await shdwDrive
        ?.createStorageAccount('profile', '500KB', 'v2')
        .then((res) => {
          setStorageAccount(new solana.PublicKey(res.shdw_bucket));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [connection, wallet]);

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        initialiseStorageAccount();
      }
    })();
  }, [wallet?.publicKey]);

  const initialiseFile = (metadata: any) => {
    // Create a new File object
    const myFile = new File([JSON.stringify(metadata)], 'myFile1.txt', {
      type: 'text/plain',
      lastModified: new Date().getDate()
    });
    console.log('myFile: ', myFile);
    setFile(myFile);
  };

  const uploadFile = async () => {
    if (wallet?.publicKey) {
      const drive = await new ShdwDrive(connection, wallet).init();
      if (!storageAccount || !profile) {
        initialiseStorageAccount();
      }

      if (storageAccount && profile) {
        const upload = await drive?.uploadFile(storageAccount, file, 'v2');
        console.log(`File uploaded: ${JSON.stringify(upload)}`);
      }
    } else {
      toast.error('Please connect your wallet');
    }
  };

  useEffect(() => {
    initialiseFile(props.data);
  }, [storageAccount, props]);

  return (
    <Button shadow color="primary" auto onPress={uploadFile}>
      Submit
    </Button>
  );
}
