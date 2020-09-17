import { 
    Children, 
    Context
} from "@bikeshaving/crank";
import { 
    Action, 
    AnyAction, 
    CombinedState, 
    Store, 
    Dispatch, 
    Unsubscribe
} from "redux";

const PROVIDER_STORE_KEY = "store";

export interface DispatchProp<A extends Action = AnyAction> {
    dispatch: Dispatch<A>;
}

export function Provider(this: Context, {store, children}: {store: any, children: Array<unknown> | unknown}) {
    this.provide(PROVIDER_STORE_KEY, store);
    return children;
}

export function connect<TStateProps, TDispatchProps, TOwnProps, TMergedProps, TState>(
    component: (this: Context<TMergedProps>, props: TMergedProps) => Children, 
    mapStateToProps?: (state: TState, props: TOwnProps) => TStateProps,
    mapDispatchToProps?: (dispatch: Dispatch<Action>, ownProps: TOwnProps) => TDispatchProps,
    mergeProps?: (stateProps: TStateProps, dispatchProps: TDispatchProps, ownProps: TOwnProps) => TMergedProps
): (this: Context<TOwnProps>, props: TOwnProps) => Iterator<Children, Children | void, any>
{
    return function*(this: Context<TOwnProps>, ownProps: TOwnProps): Iterator<Children, Children | void, any> {
        const store = this.consume(PROVIDER_STORE_KEY) as Store<CombinedState<TState>, AnyAction>;

        let unsubscribe: Unsubscribe | null = null;
        let stateProps: TStateProps;
        let wasStateMapped = false;
        let shouldUpdateOnPropChange = true;
        if (mapStateToProps) {
            stateProps = mapStateToProps(store.getState(), ownProps);
            wasStateMapped = true;

            // If the mapper takes an ownProps argument...
            shouldUpdateOnPropChange = mapStateToProps.length == 2;

            unsubscribe = store.subscribe(() => {
                const newStateProps = mapStateToProps(store.getState(), ownProps);
                if (stateProps !== newStateProps) {
                    stateProps = newStateProps;

                    // Avoid a redundant map call in the for loop.
                    wasStateMapped = true;

                    this.refresh();
                }
            });
        }
        else {
            stateProps = {} as TStateProps;
        }

        // Crank will call this HOC generator any time the props change.
        // https://crank.js.org/guides/reusable-logic
        try {
            for (const updatedOwnProps of this) {
                // Update ownProps so subscribe closure has latest values.
                ownProps = updatedOwnProps;

                if (mapStateToProps && !wasStateMapped && shouldUpdateOnPropChange) {
                    stateProps = mapStateToProps(store.getState(), ownProps);
                }

                wasStateMapped = false;

                let dispatchProps: TDispatchProps | DispatchProp;
                if (mapDispatchToProps) {
                    dispatchProps = mapDispatchToProps(store.dispatch, ownProps)
                }
                else {
                    dispatchProps = { dispatch: store.dispatch };
                }

                let mergedProps: TMergedProps;
                if (mergeProps) {
                    mergedProps = mergeProps(stateProps, dispatchProps as TDispatchProps, ownProps);
                }
                else {
                    mergedProps = { ...ownProps, ...stateProps, ...dispatchProps } as any as TMergedProps;
                }

                yield component.call(this as any as Context<TMergedProps>, mergedProps);
            }
        }
        finally {
            if (unsubscribe) {
                unsubscribe();
            }
        }
    }
}
