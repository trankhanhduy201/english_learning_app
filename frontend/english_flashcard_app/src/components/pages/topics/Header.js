import { memo } from "react";
import DeleteConfirmButton from "../../DeleteConfirmButton";
import { Link } from "react-router-dom";

const Header = memo(() => {
  return (
    <>
      <div className="d-flex align-items-center">
        <h2 className="text-start me-auto">Topics</h2>
        <div id="topic__header-buttons" className="d-flex justify-content-end align-items-center">
          <Link className="btn btn-primary me-2" to={"/topics/new"}>
            <i className="bi bi-plus-circle"></i>
            <span className="btn-text --d-sm-none"> New topic</span>
          </Link>
          <DeleteConfirmButton
            label="Delete all"
            action={`/topics/delete`}
            formName={"deleting_all_topic"}
            confirmMessage={"Are you sure you want to delete all your topics?"}
          />
        </div>
      </div>
      <hr />
    </>
  );
});

export default Header;