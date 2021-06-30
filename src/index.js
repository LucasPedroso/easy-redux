import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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

  return {
    componentName,
    state,
    hasPermission,
    // extra functions
    // easyReduxDispatchToProps,
    setStateInRedux,
    reducer,
    action: actionCreator,
  };
}

export default EasyRedux;

const optionsDefault = {
  // todo options
  combineReducers: false, // Sem efeito por enquanto
  // Caso usou combineReducers, coloque o nome que escolheu para este reducer
  nameReducer: undefined,
};

export const useStateEasyRedux = (clazz, initialState, options = optionsDefault) => {
  const optSelector = (stt) => (
    options.nameReducer ? stt[options.nameReducer][clazz.name] : stt[clazz.name]
  );
  const selector = useSelector((stt) => optSelector(stt));
  const stateDefault = useMemo(() => (selector || initialState), [selector]);

  const [state, setState] = useState(stateDefault);

  const ref = useRef();
  const dispatch = useDispatch();

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

  useEffect(() => {
    dispatch(stateRedux.action());
    if (typeof ref.current === 'function') ref.current(state);
    ref.current = null;
  }, [state]);

  return [state, setLegacyState, stateRedux, selector];
};
