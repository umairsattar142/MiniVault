import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthForms = ({ setUser, setAuthError, authError, loading, setLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(true);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {showLoginForm ? "Login" : "Sign Up"}
      </h2>
      
      <form onSubmit={showLoginForm ? handleLogin : handleSignUp}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            required
          />
        </div>
        
        {authError && (
          <div className="mb-4 text-red-500 text-sm">{authError}</div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition"
        >
          {loading ? "Processing..." : (showLoginForm ? "Login" : "Sign Up")}
        </button>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowLoginForm(!showLoginForm)}
            className="text-gray-600 hover:underline"
          >
            {showLoginForm 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForms;