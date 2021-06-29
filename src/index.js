import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useStore, useDispatch, useSelector } from 'react-redux';
// import store from '../store';

function actionCreator() {
  const state = {
    componentName: this.componentName,
    state: this.state,
    hasPermission: this.hasPermission,
  };
  const type = state.state.actionType
    ? `${state.componentName}/${state.state.actionType}`
    : `${state.componentName}/SET_STATE_CLASS`;
  const result = {
    type,
    payload: state,
  };
  return result;
}

const actionSetStateClass = (payload) => (
  payload
    ? `${payload.componentName}/SET_STATE_CLASS`
    : 'ERROR'
);

const actionX = (payload) => (
  payload
    ? `${payload.componentName}/${payload.state.actionType}`
    : 'ERROR'
);

export function reducer(state = {}, { type, payload }) {
  switch (type) {
  case actionSetStateClass(payload):
  case actionX(payload):
    if (payload.hasPermission.includes(payload.componentName)) {
      // todo
    }
    return {
      ...state,
      [payload.componentName]: {
        ...payload.state,
        hasPermission: payload.hasPermission,
      },
    };
  case 'ERROR':
    console.error('Não foi possível criar a action');
    return state;
  default:
    return state;
  }
}

export function setStateInRedux() {

}

export const easyReduxDispatchToProps = (dispatchToProps) => ({
  setStateInRedux: (action) => dispatchToProps(action),
});

function EasyRedux(component, initialState, hasPermission = [component.name]) { //  = [clazz.name]
  console.log(hasPermission)
  const componentName = component.name;
  const stateClass = initialState.state;
  const stateHook = initialState;
  const state = stateClass || stateHook;
  // const store = useStore();
  // const dispatch = useDispatch();
  // const useThunkDispatch = () => useDispatch();

  return {
    componentName,
    state,
    hasPermission,
    // store,
    // dispatch,
    // useThunkDispatch,
    // extra functions
    // easyReduxDispatchToProps,
    setStateInRedux,
    reducer,
    action: actionCreator,
  };
}

const optionsDefault = {
  combineReducer: false,
  nameReducer: undefined,
}

export const useStateEasyRedux = (clazz, initialState, options = optionsDefault) => {
  const [state, setState] = useState(initialState);

  const ref = useRef();
  const dispatch = useDispatch();
  // const useThunkDispatch = () => useDispatch();
  // const selector = useSelector((stt) => stt.cpnt[clazz.name]);

  const setLegacyState = useCallback((stt, fnCb) => {
    ref.current = fnCb;
    if (typeof stt === 'function') {
      setState((prevState) => ({ ...prevState, ...stt(prevState) }));
      return;
    }
    if (typeof stt === 'object' && !Array.isArray(stt)) {
      setState((os) => ({ ...os, ...stt }));
      return;
    }
    setState((os) => ({ ...os, [stt]: stt }));
  }, [setState]);

  const stateRedux = useMemo(() => new EasyRedux(clazz, state), [state]);

  const optSelector = (stt) => (
    options.nameReducer 
      ? stt[options.nameReducer][stateRedux.componentName]
      : stt[stateRedux.componentName]
  );
  const getStateRedux = useSelector((stt) => optSelector(stt));

  useEffect(() => {
    dispatch(stateRedux.action());
    // stateRedux.dispatch(stateRedux.action());
    if (typeof ref.current === 'function') ref.current(state);
    ref.current = null;
  }, [state]);

  return [state, setLegacyState, stateRedux, getStateRedux];
};

export default EasyRedux;
