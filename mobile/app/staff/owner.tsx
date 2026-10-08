import { router } from "expo-router";
import { useState } from "react";
import { ownerSignIn } from "../../src/api";
import { Field } from "../../src/components/Field";
import { Form } from "../../src/components/Form";
import { useStaff } from "../../src/staff";

export default function OwnerSignInScreen() {
  const { start } = useStaff();
  const [code, setCode] = useState("");

  return (
    <Form
      title="Owner sign-in"
      lead="Enter your Owner ID to manage your team and see every shop's orders."
      submitLabel="Sign in"
      canSubmit={Boolean(code.trim())}
      onSubmit={async () => {
        await start(await ownerSignIn(code));
        router.dismissTo("/staff");
      }}
    >
      <Field
        label="Owner ID"
        value={code}
        onChangeText={setCode}
        placeholder="XXXX-XXXX-XXXX-XXXX"
        secureTextEntry
        autoCapitalize="characters"
      />
    </Form>
  );
}
