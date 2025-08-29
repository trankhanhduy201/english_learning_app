import { memo } from "react";
import { Form } from "react-bootstrap";
import LogoutItem from "../components/LogoutItem";

const Settings = memo(() => {
  return (
    <>
      <h2 className="text-start">Settings</h2>
      <hr />
      <div className="row">
        <div className="col-12 col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0">
              Do you want to logout all machines?
            </p>
            <LogoutItem revokeTokens={true}>
              <button className="btn btn-primary btn-sm">
                yes
              </button>
            </LogoutItem>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">
              Allow login multiple machines
            </p>
            <Form>
              <Form.Check type="switch" id="custom-switch" />
            </Form>
          </div>
        </div>
      </div>
    </>
  );
});

export default Settings;
