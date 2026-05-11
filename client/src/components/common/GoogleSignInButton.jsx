import { useEffect, useRef, useState } from "react";

const scriptId = "google-identity-services";
let initializedClientId = null;
let activeCallback = null;

const GoogleSignInButton = ({ onSuccess, onError, text = "signin_with" }) => {
  const buttonRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      setIsReady(Boolean(window.google?.accounts?.id));
      existingScript.addEventListener("load", () => setIsReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsReady(true);
    script.onerror = () => onError?.("Google login failed to load.");
    document.head.appendChild(script);
  }, [clientId, onError]);

  useEffect(() => {
    if (!isReady || !buttonRef.current || !window.google?.accounts?.id) return;

    activeCallback = onSuccess;

    if (initializedClientId !== clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => activeCallback?.(response.credential),
      });
      initializedClientId = clientId;
    }

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: buttonRef.current.offsetWidth,
      text,
    });
  }, [clientId, isReady, onSuccess, text]);

  if (!clientId) return null;

  return <div ref={buttonRef} className="w-full min-h-10" />;
};

export default GoogleSignInButton;
