import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { GraphData } from '@/types/note';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (nodeId: string) => void;
  selectedNodeId: string | null;
}

export const GraphView = ({ data, onNodeClick, selectedNodeId }: GraphViewProps) => {
  const graphRef = useRef<ForceGraphMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeClick = useCallback(
    (node: { id?: string | number }) => {
      if (node.id) {
        onNodeClick(String(node.id));
      }
    },
    [onNodeClick]
  );

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(1.5, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.5, 400);
    }
  };

  const handleCenter = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const nodeCanvasObject = useCallback(
    (node: { x?: number; y?: number; id?: string | number; name?: string; color?: string }, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.name || '';
      const fontSize = Math.max(12 / globalScale, 3);
      const nodeSize = 6;
      const isSelected = node.id === selectedNodeId;

      // Draw glow effect
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, nodeSize * 2.5, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(
          node.x || 0,
          node.y || 0,
          nodeSize,
          node.x || 0,
          node.y || 0,
          nodeSize * 3
        );
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw outer glow
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, nodeSize * 1.5, 0, 2 * Math.PI);
      const outerGradient = ctx.createRadialGradient(
        node.x || 0,
        node.y || 0,
        nodeSize * 0.5,
        node.x || 0,
        node.y || 0,
        nodeSize * 1.5
      );
      outerGradient.addColorStop(0, node.color || 'hsl(175, 80%, 50%)');
      outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGradient;
      ctx.fill();

      // Draw node
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, nodeSize, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || 'hsl(175, 80%, 50%)';
      ctx.fill();

      // Draw inner highlight
      ctx.beginPath();
      ctx.arc((node.x || 0) - 1, (node.y || 0) - 1, nodeSize * 0.4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // Draw label
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(label, node.x || 0, (node.y || 0) + nodeSize + fontSize);
    },
    [selectedNodeId]
  );

  const linkCanvasObject = useCallback(
    (link: { source?: { x?: number; y?: number }; target?: { x?: number; y?: number } }, ctx: CanvasRenderingContext2D) => {
      const source = link.source as { x?: number; y?: number } | undefined;
      const target = link.target as { x?: number; y?: number } | undefined;
      
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x || 0, source.y || 0);
      ctx.lineTo(target.x || 0, target.y || 0);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    []
  );

  return (
    <div ref={containerRef} className="relative w-full h-full graph-container">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleCenter}
          className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg">
        Click a node to open note • Drag to pan • Scroll to zoom
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeRelSize={6}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.002}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => 'rgba(56, 189, 248, 0.6)'}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
};
