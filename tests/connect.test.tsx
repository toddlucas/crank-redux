import { createElement } from "@bikeshaving/crank";
import { renderer } from "@bikeshaving/crank/cjs/html";
import { Action, Dispatch } from "redux";
import { createTestStore } from "./utilities/store";
import { connect, DispatchProp, Provider } from "../src";

interface StoreState {
    count: number;
}

interface OwnProps {
    message: string
}

interface StateProps {
    countValue: string
}

interface DispatchProps {
    increment: () => void;
}

type MergedProps1 = OwnProps & StateProps & DispatchProp;
type MergedProps2 = OwnProps & StateProps & DispatchProps;

test('Connected component with no props', () => {
    function Component() {
        return <div>simple component</div>;
    }

    const Connected = connect(Component);

    const unsubscribe = jest.fn();
    const store = createTestStore(undefined, undefined, unsubscribe);
    const key = {};

    expect(renderer.render(
        <Provider store={store}>
            <Connected />
        </Provider>, 
        key)
    ).toEqual("<div>simple component</div>");
    renderer.render(null, key);

    // Store is not subscribed to without mapStateToProps.
    expect(unsubscribe).not.toHaveBeenCalled();
});


test('Connected component with own props', () => {
    function Component(props: OwnProps & DispatchProp) {
        props.dispatch({ type: "test type" });
        return <div>{props.message}</div>;
    }

    const Connected = connect(Component);

    const subscribe = jest.fn();
    const store = createTestStore(undefined, subscribe);
    const key = {};

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message" />
        </Provider>, 
        key)
    ).toEqual("<div>test message</div>");

    // Store is not subscribed to without mapStateToProps.
    expect(subscribe).not.toHaveBeenCalled();
});

test('Connected component with mapStateToProps1', () => {
    function Component(props: MergedProps1 & DispatchProp) {
        props.dispatch({ type: "test type" });
        return <div>{props.message}: countValue = {props.countValue}</div>;
    }

    const mapStateToProps1 = (state: StoreState): StateProps => {
        return {
            countValue: state.count.toString(),
        };
    };

    const Connected = connect(Component, mapStateToProps1);

    const unsubscribe = jest.fn();
    const store = createTestStore(undefined, undefined, unsubscribe, { count: 1 });
    const key = {};

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message" />
        </Provider>,
        key)
    ).toEqual("<div>test message: countValue = 1</div>");
    expect(unsubscribe).not.toHaveBeenCalled();

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message 2" />
        </Provider>, 
        key)
    ).toEqual("<div>test message 2: countValue = 1</div>");
    expect(unsubscribe).not.toHaveBeenCalled();

    renderer.render(null, key);
    expect(unsubscribe).toHaveBeenCalled();
});

test('Connected component with mapStateToProps2', () => {
    function Component(props: MergedProps1 & DispatchProp) {
        props.dispatch({ type: "test type" });
        return <div>{props.message}: countValue = {props.countValue}</div>;
    }

    const mapStateToProps2 = (state: StoreState, props: OwnProps): StateProps => {
        return {
            countValue: state.count.toString(),
        };
    };

    const Connected = connect(Component, mapStateToProps2);

    const unsubscribe = jest.fn();
    const store = createTestStore(undefined, undefined, unsubscribe, { count: 2 });
    const key = {};

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message" />
        </Provider>, 
        key)
    ).toEqual("<div>test message: countValue = 2</div>");
    expect(unsubscribe).not.toHaveBeenCalled();

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message 2" />
        </Provider>, 
        key)
    ).toEqual("<div>test message 2: countValue = 2</div>");
    expect(unsubscribe).not.toHaveBeenCalled();

    renderer.render(null, key);
    expect(unsubscribe).toHaveBeenCalled();
});

test('Connected component with mapDispatchToProps', () => {
    function Component(props: MergedProps2) {
        props.increment();
        return <div>{props.message}</div>;
    }

    const increment = jest.fn();
    const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: OwnProps): DispatchProps => {
        return {
            increment,
        }
    };

    const Connected = connect(Component, undefined, mapDispatchToProps);

    const subscribe = jest.fn();
    const store = createTestStore(undefined, subscribe);
    const key = {};

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message" />
        </Provider>, 
        key)
    ).toEqual("<div>test message</div>");
    expect(increment).toHaveBeenCalled();
    expect(subscribe).not.toHaveBeenCalled();
});

test('Connected component with mapStateToProps and mapDispatchToProps', () => {
    function Component(props: MergedProps2) {
        props.increment();
        return <div>{props.message}: countValue = {props.countValue}</div>;
    }

    const mapStateToProps = (state: StoreState, props: OwnProps): StateProps => {
        return {
            countValue: state.count.toString(),
        };
    };

    const increment = jest.fn();
    const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: OwnProps): DispatchProps => {
        return {
            increment,
        }
    };

    const Connected = connect(Component, mapStateToProps, mapDispatchToProps);

    const subscribe = jest.fn();
    const unsubscribe = jest.fn();
    const store = createTestStore(undefined, subscribe, unsubscribe, { count: 3 });
    const key = {};

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message" />
        </Provider>, 
        key)
    ).toEqual("<div>test message: countValue = 3</div>");
    expect(increment).toHaveBeenCalled();
    expect(subscribe).toHaveBeenCalled();
    expect(unsubscribe).not.toHaveBeenCalled();
});


test('Connected component with mapStateToProps, mapDispatchToProps, and mergeProps', () => {
    function Component(props: MergedProps2) {
        props.increment();
        return <div>{props.message}: countValue = {props.countValue}</div>;
    }

    const mapStateToProps = (state: StoreState, props: OwnProps) => {
        return {
            countValue: state.count.toString(),
        };
    };

    const increment = jest.fn();
    const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: OwnProps) => {
        return {
            increment,
        }
    };

    const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => {
        return { ...ownProps, ...stateProps, ...dispatchProps };
    }

    const Connected = connect(Component, mapStateToProps, mapDispatchToProps, mergeProps);

    const subscribe = jest.fn();
    const unsubscribe = jest.fn();
    const store = createTestStore(undefined, subscribe, unsubscribe, { count: 4 });
    const key = {};

    expect(renderer.render(
        <Provider store={store}>
            <Connected message="test message" />
        </Provider>, 
        key)
    ).toEqual("<div>test message: countValue = 4</div>");
    expect(increment).toHaveBeenCalled();
    expect(subscribe).toHaveBeenCalled();
    expect(unsubscribe).not.toHaveBeenCalled();

    renderer.render(null, key);
    expect(unsubscribe).toHaveBeenCalled();
});
