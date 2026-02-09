import { memo, Suspense } from "react";
import { Await, useFetcher, useLoaderData } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import FieldErrors from "../components/FieldErrors";
import UploadImageInput from "../components/UploadImageInput";

const Profile = memo(() => {
  const { profileData } = useLoaderData();
  const profileFetcher = useFetcher();
  const actionData = profileFetcher.data;

  const isSubmitting = profileFetcher.state === "submitting";

  return (
    <div className="row">
      <div className="col-lg-12 text-start mb-4">
        <div className="d-flex align-item-center">
          <h2>Profile</h2>
        </div>
        <hr />

        <Suspense
          fallback={
            <>
              <LoadingOverlay />
            </>
          }
        >
          <Await resolve={profileData}>
            {(profile) => (
              (() => {
                const resolvedProfile = profileFetcher?.data?.data ?? profile;
                const resolvedUser = resolvedProfile?.user ?? resolvedProfile ?? {};

                return (
              <profileFetcher.Form
                method="post"
                action="/profile"
                encType="multipart/form-data"
              >
                <input type="hidden" name="_not_revalidate" defaultValue={"1"} />
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Avatar</label>
                    <UploadImageInput
                      name="avatar"
                      imageUrl={resolvedUser?.avatar ?? null}
                    />
                    {actionData?.errors?.avatar && (
                      <FieldErrors errors={actionData.errors.avatar} />
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      defaultValue={resolvedUser?.username ?? ""}
                      disabled={1}
                    />
                  </div>
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      defaultValue={resolvedUser?.email ?? ""}
                      placeholder="Email..."
                      disabled={isSubmitting}
                    />
                    {actionData?.errors?.email && (
                      <FieldErrors errors={actionData.errors.email} />
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">First name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="first_name"
                      defaultValue={resolvedUser?.first_name ?? ""}
                      placeholder="First name..."
                      disabled={isSubmitting}
                    />
                    {actionData?.errors?.first_name && (
                      <FieldErrors errors={actionData.errors.first_name} />
                    )}
                  </div>
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">Last name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="last_name"
                      defaultValue={resolvedUser?.last_name ?? ""}
                      placeholder="Last name..."
                      disabled={isSubmitting}
                    />
                    {actionData?.errors?.last_name && (
                      <FieldErrors errors={actionData.errors.last_name} />
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-pencil-square text-white"></i>{" "}
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </profileFetcher.Form>
                );
              })()
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
});

export default Profile;
