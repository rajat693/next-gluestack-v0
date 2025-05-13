import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  useLayoutEffect,
  useContext,
  useReducer,
} from "react";
// Import all UI components
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContentText,
  AccordionIcon,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
  ActionsheetScrollView,
  ActionsheetVirtualizedList,
  ActionsheetFlatList,
  ActionsheetSectionList,
  ActionsheetSectionHeaderText,
  ActionsheetIcon,
} from "@/components/ui/actionsheet";

import { Alert, AlertText, AlertIcon } from "@/components/ui/alert";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCloseButton,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog";

import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";

import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";

import { Box } from "@/components/ui/box";

import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { Center } from "@/components/ui/center";

import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from "@/components/ui/checkbox";

import { Divider } from "@/components/ui/divider";

import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";

import { Fab, FabLabel, FabIcon } from "@/components/ui/fab";

import { FlatList } from "@/components/ui/flat-list";

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlLabelAstrick,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";

import { Grid, GridItem } from "@/components/ui/grid";

import { Heading } from "@/components/ui/heading";

import { HStack } from "@/components/ui/hstack";

import {
  Icon,
  createIcon,
  AddIcon,
  AlertCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AtSignIcon,
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  ClockIcon,
  CloseIcon,
  CloseCircleIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  FavouriteIcon,
  GlobeIcon,
  GripVerticalIcon,
  HelpCircleIcon,
  InfoIcon,
  LinkIcon,
  ExternalLinkIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  MessageCircleIcon,
  MoonIcon,
  PaperclipIcon,
  PhoneIcon,
  PlayIcon,
  RemoveIcon,
  RepeatIcon,
  Repeat1Icon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SlashIcon,
  StarIcon,
  SunIcon,
  ThreeDotsIcon,
  TrashIcon,
  UnlockIcon,
} from "@/components/ui/icon";

import { Image } from "@/components/ui/image";

import { ImageBackground } from "@/components/ui/image-background";

import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";

// import { InputAccessoryView } from "@/components/ui/input-accessory-view";

import { KeyboardAvoidingView } from "@/components/ui/keyboard-avoiding-view";

import { Link, LinkText } from "@/components/ui/link";

import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from "@/components/ui/menu";

import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";

import {
  Popover,
  PopoverBackdrop,
  PopoverArrow,
  PopoverCloseButton,
  PopoverFooter,
  PopoverHeader,
  PopoverBody,
  PopoverContent,
} from "@/components/ui/popover";

import { Portal } from "@/components/ui/portal";

import { Pressable } from "@/components/ui/pressable";

import { Progress, ProgressFilledTrack } from "@/components/ui/progress";

import {
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  RadioIcon,
} from "@/components/ui/radio";

import { RefreshControl } from "@/components/ui/refresh-control";

import { SafeAreaView } from "@/components/ui/safe-area-view";

import { ScrollView } from "@/components/ui/scroll-view";

import { SectionList } from "@/components/ui/section-list";

import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectScrollView,
  SelectVirtualizedList,
  SelectFlatList,
  SelectSectionList,
  SelectSectionHeaderText,
} from "@/components/ui/select";

import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

import {
  Slider,
  SliderThumb,
  SliderTrack,
  SliderFilledTrack,
} from "@/components/ui/slider";

import { Spinner } from "@/components/ui/spinner";

import { StatusBar } from "@/components/ui/status-bar";

import { Switch } from "@/components/ui/switch";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableData,
  TableCaption,
} from "@/components/ui/table";

import { Text } from "@/components/ui/text";

import { Textarea, TextareaInput } from "@/components/ui/textarea";

import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

import { Tooltip, TooltipContent, TooltipText } from "@/components/ui/tooltip";

import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";

import { View } from "@/components/ui/view";

import { VirtualizedList } from "@/components/ui/virtualized-list";

import { VStack } from "@/components/ui/vstack";

export const scope = {
  // Accordion
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContentText,
  AccordionIcon,
  AccordionContent,

  // Actionsheet
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
  ActionsheetScrollView,
  ActionsheetVirtualizedList,
  ActionsheetFlatList,
  ActionsheetSectionList,
  ActionsheetSectionHeaderText,
  ActionsheetIcon,

  // Alert
  Alert,
  AlertText,
  AlertIcon,

  // AlertDialog
  AlertDialog,
  AlertDialogContent,
  AlertDialogCloseButton,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,

  // Avatar
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
  AvatarGroup,

  // Badge
  Badge,
  BadgeIcon,
  BadgeText,

  // Box
  Box,

  // Button
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,

  // Card
  Card,

  // Center
  Center,

  // Checkbox
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,

  // Divider
  Divider,

  // Drawer
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,

  // Fab
  Fab,
  FabLabel,
  FabIcon,

  // FlatList
  FlatList,

  // FormControl
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlLabelAstrick,
  FormControlHelper,
  FormControlHelperText,

  // Grid
  Grid,
  GridItem,

  // Heading
  Heading,

  // HStack
  HStack,

  // Icon
  Icon,
  createIcon,
  AddIcon,
  AlertCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AtSignIcon,
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  ClockIcon,
  CloseIcon,
  CloseCircleIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  FavouriteIcon,
  GlobeIcon,
  GripVerticalIcon,
  HelpCircleIcon,
  InfoIcon,
  LinkIcon,
  ExternalLinkIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  MessageCircleIcon,
  MoonIcon,
  PaperclipIcon,
  PhoneIcon,
  PlayIcon,
  RemoveIcon,
  RepeatIcon,
  Repeat1Icon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SlashIcon,
  StarIcon,
  SunIcon,
  ThreeDotsIcon,
  TrashIcon,
  UnlockIcon,

  // Image
  Image,

  // ImageBackground
  ImageBackground,

  // Input
  Input,
  InputField,
  InputIcon,
  InputSlot,

  // InputAccessoryView
  // InputAccessoryView,

  // KeyboardAvoidingView
  KeyboardAvoidingView,

  // Link
  Link,
  LinkText,

  // Menu
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,

  // Modal
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,

  // Popover
  Popover,
  PopoverBackdrop,
  PopoverArrow,
  PopoverCloseButton,
  PopoverFooter,
  PopoverHeader,
  PopoverBody,
  PopoverContent,

  // Portal
  Portal,

  // Pressable
  Pressable,

  // Progress
  Progress,
  ProgressFilledTrack,

  // Radio
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  RadioIcon,

  // RefreshControl
  RefreshControl,

  // SafeAreaView
  SafeAreaView,

  // ScrollView
  ScrollView,

  // SectionList
  SectionList,

  // Select
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectScrollView,
  SelectVirtualizedList,
  SelectFlatList,
  SelectSectionList,
  SelectSectionHeaderText,

  // Skeleton
  Skeleton,
  SkeletonText,

  // Slider
  Slider,
  SliderThumb,
  SliderTrack,
  SliderFilledTrack,

  // Spinner
  Spinner,

  // StatusBar
  StatusBar,

  // Switch
  Switch,

  // Table
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableData,
  TableCaption,

  // Text
  Text,

  // Textarea
  Textarea,
  TextareaInput,

  // Toast
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,

  // Tooltip
  Tooltip,
  TooltipContent,
  TooltipText,

  // Utils
  useBreakpointValue,

  // View
  View,

  // VirtualizedList
  VirtualizedList,

  // VStack
  VStack,

  // React (Important for hooks)
  React,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useContext,
  useReducer,
};
