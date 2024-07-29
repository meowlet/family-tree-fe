import * as React from "react";

export interface INodeProps {
  _id: string;
  familyTree: any;
  user: any;
  parrentNode: any;
  spouse: any;
  gender: Boolean;
  updatedAt: Date;
  createdAt: Date;
}

export default class Node extends React.Component<INodeProps> {
  public render() {
    return (
      <div>
        <div>Node</div>
        <div>{this.props._id}</div>
        <div>{this.props.familyTree}</div>
        <div>{this.props.user}</div>
        <div>{this.props.parrentNode}</div>
        <div>{this.props.spouse}</div>
      </div>
    );
  }
}
