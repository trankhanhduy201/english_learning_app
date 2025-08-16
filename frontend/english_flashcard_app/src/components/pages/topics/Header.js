import { memo } from "react";
import DeleteAllButton from "../../DeleteAllButton";
import { Link } from "react-router-dom";

const Header = memo(() => {
  return (
    <>
      <div className="d-flex align-items-center">
        <h2 className="text-start me-auto">Topics</h2>
        <div className="d-flex justify-content-end align-items-center">
          <Link className="btn btn-secondary me-2" to={"/topics/new"}>
            <i className="bi bi-plus-circle"></i> New topic
          </Link>
          <DeleteAllButton
            action={`/topics/delete`}
            formName={"deleting_all_topic"}
          />
        </div>
      </div>
      <hr />
    </>
  );
});

export default Header;