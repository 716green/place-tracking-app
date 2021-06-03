import React, { useState, useContext } from 'react';
import { useForm } from '../../shared/hooks/form-hook';
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_EMAIL,
} from '../../shared/util/validators';
import { Input } from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import './Authenticate.css';
import { AuthContext } from '../../shared/context/auth-context';
import { ErrorModal } from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { baseURL } from '../../App';

function Authenticate() {
  const auth = useContext(AuthContext);
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false,
      },
      password: {
        value: '',
        isValid: false,
      },
    },
    false
  );

  const [signupMode, setSignupMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const switchModeHandler = () => {
    if (signupMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false,
          },
        },
        false
      );
    }
    setSignupMode(!signupMode);
  };

  const authSubmitHandler = async (event) => {
    setIsLoading(true);

    if (!signupMode) {
      try {
        event.preventDefault();
        const response = await fetch(`${baseURL}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
        });
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData?.message || 'Login error, Try again');
        }
        setIsLoading(false);
        auth.login();
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        setError(err.message || 'Something went wrong, please try again.');
      }
    } else {
      try {
        event.preventDefault();
        const response = await fetch(`${baseURL}/users/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formState.inputs.name.value,
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
        });
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData?.message || 'Login error, Try again');
        }
        setIsLoading(false);
        auth.login();
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        setError(err.message || 'Something went wrong, please try again.');
      }
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={errorHandler} />
      <div>
        {isLoading && <LoadingSpinner asOverlay />}
        <form onSubmit={authSubmitHandler} className="auth-form">
          <h2>Login Required</h2>
          {signupMode && (
            <Input
              id="name"
              element="input"
              type="text"
              label="Name"
              validators={[VALIDATOR_MINLENGTH(3)]}
              errorText="Invalid Name (Must be at least 3 characters)."
              onInput={inputHandler}
            />
          )}
          <Input
            id="email"
            element="input"
            type="text"
            label="Email"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Invalid Email Address."
            onInput={inputHandler}
          />
          <Input
            id="password"
            element="input"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Invalid Password (Too Short)"
            onInput={inputHandler}
          />
          <div className="form-buttons">
            {signupMode ? (
              <React.Fragment>
                <Button type="submit" disabled={!formState.isValid}>
                  Sign Up
                </Button>
                <p className="secondary-btn" onClick={switchModeHandler}>
                  Login
                </p>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Button type="submit" disabled={!formState.isValid}>
                  Login
                </Button>
                <p className="secondary-btn" onClick={switchModeHandler}>
                  Sign Up
                </p>
              </React.Fragment>
            )}
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}

export default Authenticate;
