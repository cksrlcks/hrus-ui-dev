import "./App.css";
import { RootLayout } from "./components/Layout";
import EditorPage from "./page/Editor";
import HomePage from "./page/Home";
import MentionPage from "./page/Mention";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/editor",
        element: <EditorPage />,
      },
      {
        path: "/mention",
        element: <MentionPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
