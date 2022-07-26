import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { flushSync } from "react-dom";
import { useDispatch, useSelector } from "react-redux";

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

type Payload = {
  componentName: string;
  state: any;
  hasPermission: string[];
  options: Options<any>
};

type Action = {
  type: string;
  payload: Payload;
};

const actionSetStateClass = (payload: Payload) =>
  payload ? `${payload.componentName}/SET_STATE_COMPONENT` : "ERROR";

const actionX = (payload: Payload) =>
  payload ? `${payload.componentName}/${payload.options.actionType}` : "ERROR";

export function reducer(state = {}, { type, payload }: Action) {
  switch (type) {
    case actionSetStateClass(payload):
    case actionX(payload):
      if (payload.hasPermission.includes(payload.componentName)) {
        return {
          ...state,
          [payload.componentName]: {
            ...payload.state,
            hasPermission: payload.hasPermission,
          },
        };
      }
      console.error(
        "You are not allowed to use this 'hook' in this component. If you want to use it, whitelist where the hook is called for the first time."
      );
      return { ...state };
    case "ERROR":
      console.error("Unable to create action");
      return state;
    default:
      return state;
  }
}

function GlobalReduxEasy<InitialState, Reducer>(
  component: React.FC | { name: string },
  initialState: InitialState,
  optionsFinal: Options<Reducer>,
  hasPermission: Array<string> = [component.name]
) {
  const componentName: string = component.name;

  return {
    componentName,
    state: initialState,
    hasPermission,
    // setStateInRedux,
    reducer,
    action: function actionCreator(): Action {
      const state: Payload = {
        componentName: this.componentName,
        state: this.state,
        hasPermission: this.hasPermission,
        options: optionsFinal
      };
      // todo (reformular actionType)
      const type = optionsFinal.actionType
        ? `${this.componentName}/${optionsFinal.actionType}`
        : `${this.componentName}/SET_STATE_COMPONENT`;

      const result: Action = {
        type,
        payload: state,
      };
      return result;
    },
  };
}

export type StateRedux = ReturnType<typeof GlobalReduxEasy>;

export default GlobalReduxEasy;

type Options<Reducer> = {
  combineReducers: boolean;
  nameReducer: Reducer extends {} ? Reducer : string;
  hasPermission: string[];
  target: React.FC | { name: string } | string;
  actionType: string;
};

const optionsDefault = {
  // todo options
  combineReducers: false,
  nameReducer: undefined,
  hasPermission: [],
  target: undefined,
  actionType: undefined,
};

type a = Parameters<typeof useStateGlobalRedux>;

export const useStateGlobalRedux = <State, Reducer = unknown>(
  component: React.FC | { name: string },
  initialState?: Partial<State>,
  options: Partial<Options<Reducer>> = optionsDefault
): [State, Function, StateRedux] => {

  const dispatch = useDispatch();

  const optionsFinal: Options<Reducer> = {
    ...optionsDefault,
    ...options,
  } as Options<Reducer>;

  const selectStateInRedux = useCallback((stateReducer: any) => {
    return optionsFinal.nameReducer
      ? stateReducer[optionsFinal.nameReducer][component.name]
      : stateReducer[component.name];
  }, [optionsDefault]);

  const selectorStateInRedux = useSelector((stateReducer) => selectStateInRedux(stateReducer));

  const stateDefault: State = useMemo(() => selectorStateInRedux || initialState, [
    selectorStateInRedux,
    initialState,
  ]);

  const [state, setState] = useState<State>(stateDefault);

  const stateRedux: StateRedux = useMemo(
    () =>
      GlobalReduxEasy<State, Reducer>(component, state, optionsFinal, [
        component.name,
        ...optionsFinal.hasPermission,
      ]),
    [state, component, optionsFinal]
  );

  if (!selectorStateInRedux) {
    console.log('DISPATCH ACTION')
    dispatch(stateRedux.action());
  }

  type CallbackRef = (prevState: State) => void;
  const callbackRef = useRef<CallbackRef | null>(null);

  const setLegacyState = useCallback((state: any, fnCb: CallbackRef): void => {
    callbackRef.current = fnCb;

    flushSync(() => {
      if (typeof state === "function") {
        setState((prevState: State) => ({
          ...prevState,
          ...state(prevState),
        }));
        return;
      }

      if (typeof state === "object" && !Array.isArray(state)) {
        setState((prevState: State) => ({
          ...prevState,
          ...state,
        }));
        return;
      }

      setState((prevState: State) => ({
        ...prevState,
        [state]: state,
      }));
    });

  }, []);
  
  useEffect(() => {
    dispatch(stateRedux.action());

    if (typeof callbackRef.current === "function") callbackRef.current(state);
    callbackRef.current = null;
  }, [state]);

  return [stateDefault, setLegacyState, stateRedux];
};
