import { message } from 'antd'
import { Engine, CursorDragType } from '../models'
import { DragStartEvent, DragMoveEvent, DragStopEvent } from '../events'

export const useResizeEffect = (engine: Engine) => {
  const findStartNodeHandler = (target: HTMLElement) => {
    const props = engine.props
    const handler = target?.closest(`*[${props.nodeResizeHandlerAttrName}]`)
    if (handler) {
      const direction = handler.getAttribute(
        props.nodeResizeHandlerAttrName as string
      )
      if (direction) {
        const element = handler.closest(`*[${props.nodeSelectionIdAttrName}]`)
        if (element) {
          const nodeId = element.getAttribute(props.nodeSelectionIdAttrName)
          if (nodeId) {
            const node = engine.findNodeById(nodeId)
            if (node) {
              return { direction, node, element }
            }
          }
        }
      }
    }
    return
  }

  engine.subscribeTo(DragStartEvent, (event) => {
    const target = event.data.target as HTMLElement
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    if (!currentWorkspace) return
    const handler = findStartNodeHandler(target)
    const helper = currentWorkspace.operation.transformHelper
    if (handler) {
      const props = engine.props
      const selectionElement = handler.element.closest(
        `*[${props.nodeSelectionIdAttrName}]`
      ) as HTMLElement
      if (selectionElement) {
        const nodeId = selectionElement.getAttribute(
          props.nodeSelectionIdAttrName
        )
        if (nodeId) {
          const node = engine.findNodeById(nodeId)
          if (node) {
            helper.dragStart({
              dragNodes: [node],
              type: 'resize',
              direction: handler.direction,
            })
          }
        }
      }
    }
  })

  engine.subscribeTo(DragMoveEvent, (event) => {
    if (engine.cursor.dragType !== CursorDragType.Resize) return
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    const helper = currentWorkspace?.operation.transformHelper
    if (!helper) return
    const dragNodes = helper.dragNodes
    if (!dragNodes.length) return
    helper.dragMove()
    dragNodes.forEach((node) => {
      const element = node.getElement()
      if (!element) return
      helper.resize(node, (rect) => {
        element.style.width = rect.width + 'px'
        element.style.height = rect.height + 'px'
        // element.style.position = 'absolute'
        // element.style.left = '0px'
        // element.style.top = '0px'
        element.style.transform = `translate3d(${rect.x}px,${rect.y}px,0)`
        node.designerProps.resizable?.move?.(node, element, rect)
      })
    })
  })

  engine.subscribeTo(DragStopEvent, (event) => {
    if (engine.cursor.dragType !== CursorDragType.Resize) return
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    const helper = currentWorkspace?.operation.transformHelper
    if (helper) {
      const dragNodes = helper.dragNodes
      helper.dragEnd()
      if (!dragNodes.length) return
      dragNodes.forEach((node) => {
        const element = node.getElement()
        if (!element) return
        node.designerProps.resizable?.end?.(node, element)
      })
    }

    const handler = findStartNodeHandler(event.data.target)
    console.log(handler?.direction)
    if (unsupportedDirections.includes(handler?.direction)) {
      message.info('使用红色的按钮改变大小时组件的top、left定位会不准，请重新调整定位')
    }
  })
}

const unsupportedDirections = ['left-center', 'center-top', 'left-top', 'left-bottom', 'right-top']