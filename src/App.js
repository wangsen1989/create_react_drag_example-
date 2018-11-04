import * as React from "react";
import {
  conditionConnectionDecoder,
  conditionConnectionEncoder,
  transformConnectionDecoder,
  transformConnectionEncoder
} from "./connectionReducers";
import {
  defaultSettings,
  dottedConnectionStyle,
  selectedConnectionStyle
} from "./settings/dag-settings";
import { onConnectionEventHandler, onEndPointClick } from "./eventHandlers";
import { setGlobal } from "./styles";

import ReactDAG, { DefaultNode } from "react-dag";
import NodeType1 from "./components/NodeType1";
import { css } from "glamor";
import dagre from "dagre";
import { data } from "./data";
/* tslint:disable */
const uuidv4 = require("uuid/v4");
/* tslint:enable */

/* tslint:disable */
const cloneDeep = require("lodash.clonedeep");
/* tslint: enable */

const dagWrapperStyles = css({
  background: "white",
  height: "100vh",
  width: "100vw",
  border:'1px solid black'
});

const registerTypes = {
  connections: {
    dotted: dottedConnectionStyle,
    selected: selectedConnectionStyle
  },
  endpoints: {}
};
const eventListeners = {
  click: onEndPointClick,
  connection: onConnectionEventHandler,
  endpointClick: onEndPointClick
};

setGlobal();
const typeToComponentMap = {
  sink: NodeType1,
  source: DefaultNode,
  transform: NodeType1
};

const getComponent = type =>
  typeToComponentMap[type] ? typeToComponentMap[type] : DefaultNode;

const getLayout = (nodes, connections, separation = 200) => {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    marginx: 0,
    marginy: 0,
    nodesep: 90,
    rankdir: "LR",
    ranker: "longest-path",
    ranksep: separation
  });
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => {
    const id = node.id;
    graph.setNode(id, {
      label: node.config ? node.config.label : "",
      width: 100,
      height: 100
    });
  });

  connections.forEach(connection => {
    graph.setEdge(connection.sourceId, connection.targetId);
  });

  dagre.layout(graph);
  return graph;
};
const graphNodes = getLayout(data.nodes, data.connections);
data.nodes = data.nodes.map(node => {
  const location = graphNodes._nodes[node.id];
  return {
    ...node,
    config: {
      ...node.config,
      style: {
        left: `${location.x}px`,
        top: `${location.y}px`
      }
    }
  };
});
export default class App extends React.Component {
  state = {
    connections: data.connections,
    nodes: data.nodes,
    zoom: 1
  };
  addNode = type => {
    const generateNodeConfig = t => ({
      config: {
        label: `Node Type: ${type} #${Math.ceil(Math.random() * 100)}`,
        type: t
      },
      id: uuidv4()
    });
    this.setState({
      nodes: [...this.state.nodes, generateNodeConfig(type)]
    });
  };
  setZoom = zoomIn => {
    if (zoomIn) {
      this.setState({ zoom: this.state.zoom + 0.2 });
    } else {
      this.setState({ zoom: this.state.zoom - 0.2 });
    }
  };
  render() {
    return [
      <div>
        <button onClick={() => this.addNode("transform")}>加节点 </button>
        <button onClick={() => this.setZoom(true)}>放大</button>
        <button onClick={() => this.setZoom(false)}>缩小</button>
        <ReactDAG
          className={`${dagWrapperStyles}`}
          key="dag"
          connections={cloneDeep(this.state.connections)}
          nodes={cloneDeep(this.state.nodes)}
          jsPlumbSettings={defaultSettings}
          connectionDecoders={[
            transformConnectionDecoder,
            conditionConnectionDecoder
          ]}
          connectionEncoders={[
            transformConnectionEncoder,
            conditionConnectionEncoder
          ]}
          eventListeners={eventListeners}
          registerTypes={registerTypes}
          onChange={({ nodes, connections }) => {
            this.setState({ nodes, connections }); // un-necessary cycle??
          }}
          zoom={this.state.zoom}
        >
          {this.state.nodes.map((node, i) => {
            const Component = getComponent(node.config.type);
            return <Component key={i} id={node.id} />;
          })}
        </ReactDAG>
        ,
      </div>
    ];
  }
}
