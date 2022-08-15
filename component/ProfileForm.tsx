import { Button, Grid, Input, Spacer, Text } from "@nextui-org/react";
import React from "react";
import UploadToShadowDrive from "./ShadowDrive";

export default function ProfileForm() {
  const [ name, setName ] = React.useState<string>("");
  const [ email, setEmail ] = React.useState<string>("");
  const [ json , setJson ] = React.useState<any>();
  
  // Everytime the name and email changes, update the metadata
  React.useEffect(() => {
    const metadata = {
      name: name,
      email: email,
    };
    setJson(metadata);
  }, [name, email])

  // const handleSubmit = async () => {
  //   const json = {
  //     name: name,
  //     email: email,
  //   }
  //   const myFile = new File([JSON.stringify(json)], 'profile.json', {
  //     type: 'application/json',
  //     lastModified: new Date().getDate(),
  //   });
  // };

  return (
    <div>
      <Text
        h1
        size={100}
        css={{
          textGradient: "45deg, $blue600 -20%, $pink600 50%",
        }}
        weight="bold"
        > 
          Profile 
      </Text>
      <Grid>
        <Input 
          labelLeft="name" 
          placeholder="modi sarkar" 
          size="xl"
          color="default"
          onChange={(e) => setName(e.target.value)}
        />
      </Grid>
      <Spacer  y={2}  />
      <Grid>
        <Input 
          labelLeft="email" 
          placeholder="modi@india.com" 
          size="xl"
          color="default"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Grid>
      <Spacer  y={2}  />
      <UploadToShadowDrive data={json} />
    </div>
  );
}