
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Alert, Container } from "@mui/material";


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, role, status } = useSelector((state) => state.auth);

  if (status === "loading") {
    return <div>Loading...</div>; 
  }


  if (!token) {
    return <Navigate to="/login" replace />;
  }

  
  if (adminOnly && role !== "admin") {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Alert severity="error">
          Access Denied. You must be an administrator to view this page.
        </Alert>
        {/* Redirect to the default dashboard */}
        <Navigate to="/tasks" replace />
      </Container>
    );
  }

  
  return children;
};

export default ProtectedRoute;
