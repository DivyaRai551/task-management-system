import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { getUsers, removeUser, updateUser } from "../features/users/usersSlice";
import MainHeader from "../components/MainHeader";
import UserFormModal from "../components/users/UserFormModal";

const UserManagementPage = () => {
  const dispatch = useDispatch();
  const { users, status, error } = useSelector((state) => state.users);
  const isLoading = status === "loading";

  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  

  useEffect(() => {
    
    dispatch(getUsers());
  }, [dispatch]);

  const handleDelete = (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action is permanent."
      )
    ) {
      dispatch(removeUser(userId));
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleCloseEdit = () => {
    setOpenEditModal(false);
    setSelectedUser(null);
  };

  
  const handleUpdate = (userId, updateData) => {
    dispatch(updateUser({ id: userId, data: updateData }))

      .unwrap()
      .then(() => {
        handleCloseEdit();
        
        dispatch(getUsers());
      })
      .catch((err) => {
        
        console.error("Failed to update user:", err);
      });
  };
  

  if (error && error.includes("403")) {
  
    return (
      <Alert severity="error">
        Error: You do not have administrator permissions to view this page.
      </Alert>
    );
  }

  return (
    <>
      <MainHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin User Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user._id}</TableCell>
                      <TableCell align="right">
                        {/* NOTE: Edit modal implementation is omitted for brevity, 
                        but should call the updateUser thunk */}
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(user._id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      {/* User Edit Modal (Replace this with your actual form component) */}
      {openEditModal && selectedUser && (
        
      
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            background: "rgba(0,0,0,0.5)",
            width: "100%",
            height: "100%",
            zIndex: 1000,
          }}
        >
          {/* <Alert
            severity="info"
            onClose={handleCloseEdit}
            style={{
              margin: "20vh auto",
              width: "30%",
              backgroundColor: "white",
            }}
          >
            Edit Modal for User ID: {selectedUser._id} is open. Implement
            UserFormModal here.
          </Alert> */}
          {/* Once you create UserFormModal, replace the alert with the component:*/}
          <UserFormModal
            open={openEditModal}
            onClose={handleCloseEdit}
            user={selectedUser}
            onUpdate={handleUpdate}
          />
        </div>
      )}
    </>
  );
};

export default UserManagementPage;
