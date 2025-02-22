'use client'

import * as React from 'react'

import * as SelectPrimitive from '@radix-ui/react-select'

import { CheckIcon } from '~/icons/check'
import { ChevronIcon } from '~/icons/chevron'
import { cn } from '~/utils/cn'

const SelectContext = React.createContext<
  React.Dispatch<React.SetStateAction<boolean>> | undefined
>(undefined)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('useSelectContext must be used within a SelectContext')
  }

  return context
}

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={setIsOpen}>
      <SelectPrimitive.Root open={isOpen} onOpenChange={setIsOpen} {...props} />
    </SelectContext.Provider>
  )
}

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const selectTriggerClassnames = cn(
  'group/trigger flex min-h-8 select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  'bg-gray-200 text-xs font-medium leading-none data-[state=open]:hover:bg-gray-400 dark:bg-zinc-700 dark:data-[state=open]:hover:bg-slate-600 md:text-sm',
  'ring-offset-background focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand',
  'sidebar:!bg-surface-primary sidebar:data-[state=open]:hover:!bg-surface-secondary sidebar:main-page-card:!bg-surface-secondary sidebar:main-page-card:data-[state=open]:hover:!bg-surface-tertiary',
  'z-20 transition-colors',
)

const SelectTrigger = ({
  ref,
  className,
  children,
  icon,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  icon?: React.ReactNode
}) => {
  const setIsOpen = useSelectContext()
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') e.preventDefault()
      }}
      onPointerUp={(e) => {
        if (e.pointerType === 'touch') {
          setIsOpen((prevState) => !prevState)
        }
      }}
      className={cn(selectTriggerClassnames, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        {icon ?? (
          <ChevronIcon className="size-2.5 fill-current stroke-[1.8px] transition-transform group-data-[state=open]/trigger:rotate-180 md:size-3" />
        )}
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronIcon className="size-3 rotate-180 fill-black dark:fill-white" />
  </SelectPrimitive.ScrollUpButton>
)
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronIcon className="size-3 fill-black dark:fill-white" />
  </SelectPrimitive.ScrollDownButton>
)
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = ({
  ref,
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      data-role="select-content"
      className={cn(
        'relative z-50 max-h-96 min-w-32 overflow-hidden rounded-lg bg-gray-200 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-zinc-700',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-xs font-medium md:text-sm', className)}
    {...props}
  />
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-2 pr-9 text-xs font-medium outline-none transition-colors focus:bg-gray-400 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-zinc-800 md:text-sm',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-5 stroke-black stroke-[1.6px] dark:stroke-white" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gray-200 dark:bg-zinc-700', className)}
    {...props}
  />
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  selectTriggerClassnames,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
