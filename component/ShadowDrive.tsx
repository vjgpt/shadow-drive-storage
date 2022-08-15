import React, { useEffect } from "react";
import {ShdwDrive } from "@shadow-drive/sdk";
import * as solana from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import profile from "../data/profile.json";
import { Button } from "@nextui-org/react";

export default function UploadToShadowDrive(props: any) {

	const { connection } = useConnection();
	const wallet = useWallet();
  const [storageAccount, setStorageAccount] = React.useState<solana.PublicKey | null>(null);
  const [ file, setFile ] = React.useState<any>();

  const storageAccountKey = new solana.PublicKey(process.env.NEXT_PUBLIC_STORAGE_ACCOUNT as string);

  const metadata = {
    "name": "ShadowDrive",
    "description": "A decentralized file storage system built on Solana",
  };

	useEffect(() => {
		(async () => {
			if (wallet?.publicKey) {
				const drive = await new ShdwDrive(connection, wallet).init();

        console.log("User Info", drive.userInfo.toBase58());
        // setDrive(drive);

        if (!drive) return;
        
        // Check if the storage account exists
        const storage_account = await drive.getStorageAccount(storageAccountKey).then((account) => {
          if (account) {
            setStorageAccount(account.storage_account);
          }
        }).catch(async (err) => {
          // create a storage account for the drive
          const newStorageAccount = await drive.createStorageAccount("profile", "500KB", "v2");
          const storageAccountInfo = new solana.PublicKey(newStorageAccount.shdw_bucket);

          if (storageAccountInfo) {
            // set the storage account
            setStorageAccount(storageAccountInfo);
          } else {
            console.log("Storage account not found");
          }
        });
			}
		})();
	}, [wallet?.publicKey])

  const initialiseFile = (metadata: any) => {
    // Create a new File object
    const myFile = new File([JSON.stringify(metadata)], 'myFile1.txt', {
      type: 'text/plain',
      lastModified: new Date().getDate(),
    });
    console.log("myFile: ", myFile);
    setFile(myFile);
  }

  const uploadFile = async () => {
    if (wallet?.publicKey && storageAccount && file) {
      const drive = await new ShdwDrive(connection, wallet).init();
      if (!storageAccount || !profile) {
        return console.log("Storage account not found");
      }

      const upload = await drive?.uploadFile(storageAccount, file , "v2");
      console.log(`File uploaded: ${JSON.stringify(upload)}`);

    }
  }

  useEffect(() => {
    initialiseFile(props.data);
  }, [storageAccount, profile, props])

  return (
    <Button
    shadow 
    color="primary" 
    auto 
    onPress={uploadFile}
  >
      Submit
  </Button>
  );
}