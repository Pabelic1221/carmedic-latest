import { actions } from "./userLocation";
export const setCurrentLocation = (coords) => {
  return async (dispatch) => {
    dispatch(actions.setCurrentLocation(coords));
  };
};
