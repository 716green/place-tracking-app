import React, { useState, useContext } from 'react';
// import { useHistory } from 'react-router-dom';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import { Modal } from '../../shared/components/UIElements/Modal';
import { Map } from '../../shared/components/UIElements/Map';

import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { ErrorModal } from '../../shared/components/UIElements/ErrorModal';

import { AuthContext } from '../../shared/context/auth-context';
import { baseURL } from '../../App';
import './PlaceItem.css';

const PlaceItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // const history = useHistory();

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(`${baseURL}/places/${props.id}`, 'DELETE', null, {
        Authorization: 'Bearer ' + auth.token,
      });
      props.onDelete(props.id);
      // history.push('/' + auth.userId + '/places');
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      <Modal
        show={showMap}
        onCancelHandler={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}>
        <div className="map-container">
          <Map className="map" center={props.coordinates} zoom={16} />
        </div>
      </Modal>

      <Modal
        show={showConfirmModal}
        header={'Are you sure?'}
        onCancel={cancelDeleteHandler}
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }>
        <p>
          Do you want to proceed and delete this place? Please note that this
          can't be undone.
        </p>
      </Modal>

      <li className="place-item">
        {isLoading && <LoadingSpinner />}
        <Card className="place-item__content">
          <div className="place-item__image">
            <img src={`${baseURL}/${props.image}`} alt={props.title} />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              VIEW ON MAP
            </Button>

            {auth.userId === props.creatorId && (
              <React.Fragment>
                <Button to={`/places/${props.id}`}>EDIT</Button>
                <Button danger onClick={showDeleteWarningHandler}>
                  DELETE
                </Button>
              </React.Fragment>
            )}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
