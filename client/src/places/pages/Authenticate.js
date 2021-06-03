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
    if (!signupMode) {
      console.error({ error: 'NOT SIGNUP MODE' });
    } else {
      try {
        event.preventDefault();
        const response = await fetch(`${baseURL}/users/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            name: formState.inputs.name.value,
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          },
        });
        const responseData = await response.json();
        console.log({ responseData });
        let responseIsValid = true;
        if (responseIsValid) {
          auth.login(); // only run after validating response
        } else alert('INVALID AUTH');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
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
              <Button inverse onClick={switchModeHandler}>
                Login
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button type="submit" disabled={!formState.isValid}>
                Login
              </Button>
              <Button inverse onClick={switchModeHandler}>
                Sign Up
              </Button>
            </React.Fragment>
          )}
        </div>
      </form>
    </div>
  );
}

export default Authenticate;
