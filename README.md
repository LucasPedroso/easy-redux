# easy-redux

@Author: Lucas Eduardo Pedroso

Custom Hooks para compartilhar estado global com Redux

Sendo para estados simples que não necessitariam de criar actions e toda a complexidade que redux trás.

Counter.tsx
```typescript
export function Counter() {
  const [state, setState] = useStateEasyRedux(Main, { count: 0 });

  return (
    <>
      <Header />
      <div>
        <p>Você clicou {state.count} vezes</p>
        <Button
          label="Page Count Counter++"
          onClick={() => setState({ count: state.count + 1 })}
        />
      </div>
    </>
  );
}
```

OtherComponent.tsx
```typescript
export function OtherComponent() {
  const [state, setState] = useStateEasyRedux(Main);

  return (
    <>
      <Header />

      <div>
        <p>Você clicou {state.count} vezes</p>
        <Button
          label="Page OtherComponent Counter++"
          onClick={() => setState({ count: state.count + 1 })}
        />
      </div>
    </>
  );
}
}
```

main.ts
``` 
...
import { reducer } from './lib/EasyRedux'

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));
...
```
