import { useRouteError, isRouteErrorResponse } from "react-router";

const ErrorPage = () => {
  const error = useRouteError();

  let errorStatus = 500;
  let title = "Unexpected Error";
  let message = "Something went wrong.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    title = error.statusText;
    message = error.data || "Route error occurred.";
  } else if (error instanceof Error) {
    title = error.name;
    message = error.message;
    stack = error.stack;
  } else if (typeof error === "string") {
    message = error;
  }

  const isDev = import.meta.env.DEV;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "monospace",
      }}
    >
      <h1>🚨 {errorStatus}</h1>
      <h2>{title}</h2>

      <p
        style={{
          background: "#fde68a",
          padding: "1rem",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        {message}
      </p>

      {/* DEV-ONLY STACK TRACE */}
      {isDev && stack && (
        <details style={{ marginTop: "1.5rem" }} open>
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
            📍 Stack Trace (Dev Only)
          </summary>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: "1rem",
              overflowX: "auto",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginTop: "0.5rem",
            }}
          >
            {stack}
          </pre>
        </details>
      )}

      <p style={{ marginTop: "2rem", opacity: 0.6 }}>
        I don’t know why… but better luck next time ☕
      </p>

      <button className="text-9xl active:text-7xl">🫖</button>
    </div>
  );
};

export default ErrorPage;
