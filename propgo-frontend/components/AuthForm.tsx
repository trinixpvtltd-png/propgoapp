import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";

type Props = {
  onDone: () => void;
};

export default function AuthForm({ onDone }: Props) {
  const { login, signup, skip, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      await login(email, password);
      onDone();
    } catch (error) {
      // Error already shown in AuthContext
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await signup(email, password, name, phone);
      onDone();
    } catch (error) {
      // Error already shown in AuthContext
    }
  };

  const handleSkip = () => {
    skip();
    onDone();
  };

  // return (
  //   <View style={styles.container}>
  //     <Text style={styles.title}>Welcome to PropGo</Text>
  //     <TextInput
  //       placeholder="Email"
  //       value={email}
  //       onChangeText={setEmail}
  //       style={styles.input}
  //       keyboardType="email-address"
  //       autoCapitalize="none"
  //     />
  //     <TextInput
  //       placeholder="Password"
  //       value={password}
  //       onChangeText={setPassword}
  //       style={styles.input}
  //       secureTextEntry
  //     />
  //     <TouchableOpacity style={styles.primaryBtn} onPress={() => { login(); onDone(); }}>
  //       <Text style={styles.primaryText}>Login</Text>
  //     </TouchableOpacity>
  //     <TouchableOpacity style={styles.secondaryBtn} onPress={() => { signup(); onDone(); }}>
  //       <Text style={styles.secondaryText}>Signup</Text>
  //     </TouchableOpacity>
  //     <TouchableOpacity onPress={() => { skip(); onDone(); }}>
  //       <Text style={styles.skip}>Skip for now</Text>
  //     </TouchableOpacity>
  //   </View>
  // );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PropGo</Text>
      <Text style={styles.subtitle}>
        {isSignup ? "Create your account" : "Login to continue"}
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      {isSignup && (
        <>
          <TextInput
            placeholder="Name (optional)"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!loading}
          />
          <TextInput
            placeholder="Phone (optional)"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </>
      )}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        editable={!loading}
      />

      {loading ? (
        <View style={styles.primaryBtn}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <>
          {isSignup ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup}>
              <Text style={styles.primaryText}>Create Account</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
              <Text style={styles.primaryText}>Login</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setIsSignup(!isSignup)}
          >
            <Text style={styles.secondaryText}>
              {isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip for now</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: { padding: 16 },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 10,
//     backgroundColor: "#fafafa",
//   },
//   primaryBtn: {
//     backgroundColor: "#2563eb",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 6,
//   },
//   primaryText: { color: "#fff", fontWeight: "700" },
//   secondaryBtn: {
//     borderWidth: 1,
//     borderColor: "#2563eb",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   secondaryText: { color: "#2563eb", fontWeight: "700" },
//   skip: { marginTop: 12, textAlign: "center", color: "#555" },
// });

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryText: { color: "#2563eb", fontWeight: "600" },
  skip: { marginTop: 12, textAlign: "center", color: "#555" },
});
