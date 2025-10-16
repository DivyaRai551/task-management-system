import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Typography,
  Box,
  Paper,
  Toolbar,
  CircularProgress,
  Alert, 
} from "@mui/material";
import { getTasks, setFilters, setPage } from "../features/tasks/tasksSlice";
import MainHeader from "../components/MainHeader";
import TaskListTable from "../components/tasks/TaskListTable";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskPagination from "../components/tasks/TaskPagination";
import TaskFormModal from "../components/tasks/TaskFormModal";

const TasksPage = () => {
  const dispatch = useDispatch();
  const { tasks, status, error, filters, pagination } = useSelector(
    (state) => state.tasks
  );

  
  const [openCreateModal, setOpenCreateModal] = React.useState(false);


  const fetchTasksData = useCallback(() => {

    dispatch(getTasks(filters));
  }, [dispatch, filters]); 

  
  useEffect(() => {
    
    fetchTasksData();
  }, [fetchTasksData]);

 
  const handleFilterChange = (newFilters) => {
    
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (event, newPage) => {

    dispatch(setPage(newPage));
  };

  const handleOpenCreate = () => {
    setOpenCreateModal(true);
  };

  const handleCloseCreate = () => {
    setOpenCreateModal(false);
  };

  return (
    <>
      <MainHeader />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Task Dashboard
        </Typography>

        {/* 2. Loading and Error States */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {/* Only show spinner when explicitly loading */}
        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 3. Task Filters and Create Button */}
        <Paper sx={{ mb: 2 }}>
          <TaskFilters
            currentFilters={filters}
            onFilterChange={handleFilterChange}
            onOpenCreate={handleOpenCreate}
          />
        </Paper>

        {/* 4. Task List Table */}
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TaskListTable tasks={tasks} isLoading={status === "loading"} />

          {/* 5. Pagination */}
          <Toolbar sx={{ justifyContent: "flex-end", py: 1 }}>
            <TaskPagination
              count={pagination.total_pages || 0}
              page={filters.page}
              onChange={handlePageChange}
              totalTasks={pagination.total_tasks || 0}
            />
          </Toolbar>
        </Paper>

        {/* 6. Task Form Modal (for creation) */}
        <TaskFormModal open={openCreateModal} onClose={handleCloseCreate} />
      </Container>
    </>
  );
};

export default TasksPage;
