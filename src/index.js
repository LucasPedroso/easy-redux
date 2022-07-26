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
    }
    console.log(payload.componentName, payload.componentName, payload.hasPermission);
    return {
      ...state,
      [payload.componentName]: {
        ...payload.state,
        hasPermission: payload.hasPermission,
      },
    };
  case 'ERROR':
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
  const componentName = component.name;
  const stateClass = initialState.state;
  const stateHook = initialState;
  const state = stateClass || stateHook;

  return {
    componentName,
    state,
    hasPermission,
    setStateInRedux,
    reducer,
    action: actionCreator,
  };
}

export default EasyRedux;

const optionsDefault = {
  // todo options
  combineReducers: false,
  nameReducer: undefined,
};

export const useStateEasyRedux = (clazz, initialState, options = optionsDefault) => {
  const optSelector = (stt) => {
    return options.nameReducer ? stt[options.nameReducer][clazz.name] : stt[clazz.name];
  };
  const selector = useSelector((stt) => optSelector(stt));
  const stateDefault = useMemo(
    () => (selector || initialState), [selector, initialState],
  );

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

  const stateRedux = useMemo(() => new EasyRedux(clazz, state), [state, clazz]);

  useEffect(() => {
    dispatch(stateRedux.action());
    if (typeof ref.current === 'function') ref.current(state);
    ref.current = null;
  }, [state]);

  return [state, setLegacyState, stateRedux, selector];
};

/**
 * Inject state in callback
 * (state) => { }
 *
 * const [state, setState] = useState({ count: 0 });
 *
 * Ex: setState({ count: 1 }, (state) => { console.log(state.count) });
 * // 1
 * @param {any} initialState
 * @returns {Array} [state, setState]
 *
 *
 * @author Lucas Eduardo Pedroso
 * @version 0.1.0
 */
export const useClassState = (initialState) => {
  const [state, setState] = useState(initialState);

  const ref = useRef();

  const setLegacyState = useCallback((stt, fnCb) => {
    ref.current = fnCb;
    if (typeof stt === 'function') {
      setState((prevState) => ({ ...prevState, ...stt(prevState) }));
      return;
    }
    if (typeof stt === 'object' && !Array.isArray(stt)) {
      setState((prevState) => ({ ...prevState, ...stt }));
      return;
    }
    setState((prevState) => ({ ...prevState, [stt]: stt }));
  }, []);

  useEffect(() => {
    if (typeof ref.current === 'function') ref.current(state);
    ref.current = null;
  }, [state]);

  return [state, setLegacyState];
};
