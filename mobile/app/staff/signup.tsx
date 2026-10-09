import { router } from "expo-router";
import { useState } from "react";
import { signUp } from "../../src/api";
import { Field } from "../../src/components/Field";
import { Form } from "../../src/components/Form";
import { useStaff } from "../../src/staff";

export default function SignUpScreen() {
  const { start } = useStaff();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <Form
      title="Employee sign-up"
      lead="Enter the employee number the owner gave you, then choose a password."
      submitLabel="Create account"
      canSubmit={Boolean(number && name.trim() && password && confirm)}
      onSubmit={async () => {
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        if (password !== confirm) throw new Error("The two passwords don't match.");
        await start(await signUp({ number, name: name.trim(), password }));
        router.replace("/staff/orders");
      }}
    >
      <Field
        label="Employee number"
        value={number}
        onChangeText={setNumber}
        placeholder="1234 5678"
        keyboardType="number-pad"
      />
      <Field label="Your name" value={name} onChangeText={setName} maxLength={60} autoComplete="name" />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <Field
        label="Password again"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
      />
    </Form>
  );
}
