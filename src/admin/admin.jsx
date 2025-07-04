import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, ListGroup } from "react-bootstrap";
import { FaUsers, FaCarSide, FaMapMarkerAlt, FaClipboardList, FaTools } from "react-icons/fa"; // Import relevant icons

const Admin = () => {
  return (
    <div className="admin-dashboard-welcome"> {/* Added a class for potential custom styling */}
      <Card className="text-center p-4 shadow-sm"> {/* Added shadow and padding */}
        <Card.Body>
          <Card.Title as="h1" className="mb-4 admin-welcome-heading">
            Welcome to the <span className="text-success">SnapRide Admin Panel</span>!
          </Card.Title>
          <Card.Text className="lead mb-4">
            Manage your rental platform efficiently and effectively.
          </Card.Text>

          <hr className="my-4" /> {/* Separator */}

          <Card.Title as="h3" className="mb-3 admin-features-heading">
            Admin Capabilities
          </Card.Title>
          <Card.Text className="mb-4 admin-features-description">
            As an administrator, you have full control over various aspects of the SnapRide platform.
            Here are the key features you can manage:
          </Card.Text>

          <ListGroup variant="flush" className="text-start mb-5 admin-features-list">
            <ListGroup.Item className="d-flex align-items-center">
              <FaUsers className="me-3 text-primary fs-4" />
              <div>
                <h5 className="mb-1">User Management</h5>
                <small className="text-muted">View, add, edit, and delete user accounts. Manage user roles and permissions.</small>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex align-items-center">
              <FaCarSide className="me-3 text-info fs-4" />
              <div>
                <h5 className="mb-1">Vehicle Management</h5>
                <small className="text-muted">Control vehicle inventory, add new cars, manage brands and models, and update vehicle details.</small>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex align-items-center">
              <FaMapMarkerAlt className="me-3 text-danger fs-4" />
              <div>
                <h5 className="mb-1">Location Management</h5>
                <small className="text-muted">Add, modify, or remove pick-up and drop-off locations for rentals.</small>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex align-items-center">
              <FaClipboardList className="me-3 text-warning fs-4" />
              <div>
                <h5 className="mb-1">Rental Oversight</h5>
                <small className="text-muted">Monitor all active and past rental agreements, manage booking statuses, and resolve disputes.</small>
              </div>
            </ListGroup.Item>
             <ListGroup.Item className="d-flex align-items-center">
              <FaTools className="me-3 text-secondary fs-4" />
              <div>
                <h5 className="mb-1">Contact Forms</h5>
                <small className="text-muted">Review and respond to inquiries submitted through the website's contact form.</small>
              </div>
            </ListGroup.Item>
          </ListGroup>

          <p className="mb-4">
            Please use the navigation links in the header to access these management sections.
          </p>

          <Button
            as={Link}
            to="/"
            variant="success" // Using 'success' for your green accent color
            size="lg" // Larger button
            className="mt-3 px-5 py-3 fw-bold admin-return-button"
          >
            Return to Website
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Admin;