// eslint-disable-next-line @typescript-eslint/no-unused-vars

/* eslint-disable @nx/enforce-module-boundaries */
// nx-ignore-next-line
import { ProjectGraphProjectNode } from '@nx/devkit';

import { EyeIcon } from '@heroicons/react/24/outline';
import { PropertyInfoTooltip, Tooltip } from '@nx/graph/ui-tooltips';
import {
  TargetConfigurationDetails,
  TargetConfigurationDetailsHandle,
} from '../target-configuration-details/target-configuration-details';
import { TooltipTriggerText } from '../target-configuration-details/tooltip-trigger-text';
import {
  createRef,
  ForwardedRef,
  forwardRef,
  RefObject,
  useImperativeHandle,
  useRef,
} from 'react';
import { twMerge } from 'tailwind-merge';

export interface ProjectDetailsProps {
  project: ProjectGraphProjectNode;
  sourceMap: Record<string, string[]>;
  variant?: 'default' | 'compact';
  onTargetCollapse?: (targetName: string) => void;
  onTargetExpand?: (targetName: string) => void;
  onViewInProjectGraph?: (data: { projectName: string }) => void;
  onViewInTaskGraph?: (data: {
    projectName: string;
    targetName: string;
  }) => void;
  onRunTarget?: (data: { projectName: string; targetName: string }) => void;
}

export interface ProjectDetailsImperativeHandle {
  collapseTarget: (targetName: string) => void;
  expandTarget: (targetName: string) => void;
}

export const ProjectDetails = forwardRef(
  (
    {
      project: {
        name,
        data: { root, ...projectData },
      },
      sourceMap,
      variant,
      onTargetCollapse,
      onTargetExpand,
      onViewInProjectGraph,
      onViewInTaskGraph,
      onRunTarget,
    }: ProjectDetailsProps,
    ref: ForwardedRef<ProjectDetailsImperativeHandle>
  ) => {
    const isCompact = variant === 'compact';
    const projectTargets = Object.keys(projectData.targets ?? {});
    const targetRefs = useRef(
      projectTargets.reduce((acc, targetName) => {
        acc[targetName] = createRef<TargetConfigurationDetailsHandle>();
        return acc;
      }, {} as Record<string, RefObject<TargetConfigurationDetailsHandle>>)
    );

    const displayType =
      projectData.projectType &&
      projectData.projectType?.charAt(0)?.toUpperCase() +
        projectData.projectType?.slice(1);

    useImperativeHandle(ref, () => ({
      collapseTarget: (targetName: string) => {
        targetRefs.current[targetName]?.current?.collapse();
      },
      expandTarget: (targetName: string) => {
        targetRefs.current[targetName]?.current?.expand();
      },
    }));

    return (
      <>
        <header
          className={twMerge(
            `border-b border-slate-900/10 dark:border-slate-300/10`,
            isCompact ? 'mb-2' : 'mb-4'
          )}
        >
          <h1
            className={twMerge(
              `flex items-center`,
              isCompact ? `text-2xl gap-1` : `text-4xl mb-4 gap-2`
            )}
          >
            {name}{' '}
            {onViewInProjectGraph ? (
              <EyeIcon
                className="h-5 w-5 cursor-pointer"
                onClick={() => onViewInProjectGraph({ projectName: name })}
              ></EyeIcon>
            ) : null}{' '}
          </h1>
          <div className={isCompact ? `px-4 py-2` : `p-4`}>
            {projectData.tags ? (
              <p>
                {projectData.tags?.map((tag) => (
                  <span className="bg-slate-300 rounded-md p-1 mr-2">
                    {tag}
                  </span>
                ))}
              </p>
            ) : null}
            <p>
              <span className="font-bold">Root:</span> {root}
            </p>
            {displayType ? (
              <p>
                <span className="font-bold">Type:</span> {displayType}
              </p>
            ) : null}
          </div>
        </header>
        <div>
          <h2 className={isCompact ? `text-lg mb-3` : `text-xl mb-4`}>
            <Tooltip
              openAction="hover"
              content={(<PropertyInfoTooltip type="targets" />) as any}
            >
              <span>
                <TooltipTriggerText>Targets</TooltipTriggerText>
              </span>
            </Tooltip>
          </h2>
          <ul>
            {projectTargets.map((targetName) => {
              const target = projectData.targets?.[targetName];
              return target && targetRefs.current[targetName] ? (
                <li className="mb-4 last:mb-0" key={`target-${targetName}`}>
                  <TargetConfigurationDetails
                    ref={targetRefs.current[targetName]}
                    variant={variant}
                    projectName={name}
                    targetName={targetName}
                    targetConfiguration={target}
                    sourceMap={sourceMap}
                    onRunTarget={onRunTarget}
                    onViewInTaskGraph={onViewInTaskGraph}
                    onCollapse={onTargetCollapse}
                    onExpand={onTargetExpand}
                  />
                </li>
              ) : null;
            })}
          </ul>
        </div>
      </>
    );
  }
);

export default ProjectDetails;