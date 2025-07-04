import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup, Card, Row, Col, Table, Spinner } from "react-bootstrap";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { fetchUsers } from "../../hooks/useFetchData";
import { UserRoles, isAdmin } from "../../config/general";

const LoadingContent = () => (
    <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">Loading users...</span>
        </Spinner>
        <p className="ms-3 mb-0 text-muted">Loading users...</p>
    </div>
);

const UsersManager = () => {
    const user = useSelector(({ UserSlice }) => UserSlice.user);

    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState(null); // This will now store an object: { userId1: userObj1, userId2: userObj2 }

    const refs = useRef({});

    useEffect(() => {
        const getUsers = async () => {
            setIsLoading(true);
            try {
                const response = await fetchUsers();
                // *** IMPORTANT CHANGE HERE: Transform array to object ***
                const usersObject = response.reduce((acc, currentUser) => {
                    acc[currentUser.id] = currentUser;
                    return acc;
                }, {});
                setUsers(usersObject);
            } catch (error) {
                console.error("Error fetching users:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to load users. Please try again."
                });
            } finally {
                setIsLoading(false);
            }
        };

        getUsers();
    }, []);


    const handleUpdateButton = async (userId, userEmail, currentRole) => {
        // Using the safe access for the ref's value
        let newRole = refs.current[userId] ? refs.current[userId].value : undefined;

        if (!newRole || newRole === currentRole) {
            Swal.fire({
                icon: "info",
                title: "No Change",
                text: "Please select a new role to update."
            });
            return;
        }

        setIsLoading(true);

        const userRef = doc(db, "users", userId);

        try {
            await updateDoc(userRef, { role: newRole });
            Swal.fire({
                title: "Success!",
                text: `Role for ${userEmail} updated to ${UserRoles[newRole]}!`,
                icon: "success",
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                setUsers(prevUsers => {
                    if (!prevUsers) return null;
                    const updatedUsers = { ...prevUsers };
                    // Now updatedUsers[userId] will correctly reference the user object
                    updatedUsers[userId] = { ...updatedUsers[userId], role: newRole }; // Create new object for immutability
                    return updatedUsers;
                });
            });
        } catch (err) {
            console.error("Error updating user role:", err);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong while updating the role!"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="users-manager-container">
            <h1 className="mb-4 text-center admin-panel-heading">Users Management</h1>

            <Card className="shadow-sm p-3 p-md-4 mb-5">
                <Card.Body>
                    <Card.Title as="h2" className="mb-4 text-center admin-sub-heading">Edit User Roles</Card.Title>

                    {isLoading ? (
                        <LoadingContent />
                    ) : (
                        users && Object.keys(users).length > 0 ? (
                            <div className="table-responsive">
                                <Table striped bordered hover responsive className="users-table align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Email</th>
                                            <th>Current Role</th>
                                            <th>New Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* *** IMPORTANT CHANGE HERE: Iterate over Object.values(users) *** */}
                                        {Object.values(users).map((value, index) => { // 'value' is now the user object directly
                                            const isAnAdmin = isAdmin(value.role);
                                            const isCurrentUser = value.email === user.email;
                                            const isDefaultAdmin = value.userUID === "3M9LJ5nz2PTj5I4OtHffMoa2oAD3";
                                            const isDefaultUser = value.userUID === "3fDiITFpHLf4Vgio1VBN0jUZGy52";

                                            const isDisabled = (isAnAdmin && isCurrentUser) || isDefaultAdmin || isDefaultUser;

                                            return (
                                                <tr key={value.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{value.email}</td>
                                                    <td>
                                                        <span className={`badge ${isAnAdmin ? 'bg-success' : 'bg-primary'}`}>
                                                            {UserRoles[value.role] || value.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            name={`userRole-${value.id}`}
                                                            defaultValue={value.role}
                                                            disabled={isDisabled}
                                                            ref={el => (refs.current[value.id] = el)}
                                                            className="user-role-select"
                                                        >
                                                            <option value="">Select a role...</option>
                                                            {Object.keys(UserRoles).map(roleKey => (
                                                                <option key={roleKey} value={roleKey}>
                                                                    {UserRoles[roleKey]}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="success"
                                                            type="button"
                                                            onClick={() => handleUpdateButton(value.id, value.email, value.role)}
                                                            disabled={isDisabled}
                                                            className="update-user-button"
                                                        >
                                                            Update
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center text-muted py-4">No users found.</p>
                        )
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default UsersManager;