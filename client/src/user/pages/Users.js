import React, { useState, useEffect } from 'react';

import UsersList from '../components/UsersList';
import { baseURL } from '../../App';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { ErrorModal } from '../../shared/components/UIElements/ErrorModal';

const Users = () => {
  // let allUsers;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  // const fetchUserHandler = (data) => {
  //   setUsers(data);
  //   // allUsers = users;
  // };

  useEffect(() => {
    const sendRequest = async () => {
      try {
        const response = await fetch(`${baseURL}/users`);

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setUsers(responseData.users);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
      }
    };
    sendRequest();
  }, []);

  const errorHandler = () => {
    setError(null);
  };
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={errorHandler} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && <UsersList items={users} />}
    </React.Fragment>
  );
};

export default Users;
