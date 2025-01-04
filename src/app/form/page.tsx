'use client'

import React, { useState, useMemo, FormEvent, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { ArrowUpDown } from 'lucide-react'
import { CiMenuKebab } from "react-icons/ci";
import { FiPlus } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { customerSchema } from "@/lib/customerSchema";
import { CardSchema } from '@/lib/cardSchema'
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog"

import { FaRegCreditCard } from "react-icons/fa6";
import { GrUpdate } from "react-icons/gr";
import { FaTrashCan } from "react-icons/fa6";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import InputMask from 'react-input-mask';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"



interface Customer {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    birthDate: Date;
    phone: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    cards: Card[];
}

interface Card {
    customerId: number
    id: number;
    number: string;
    valiDate: string;
    cvv: string;
}


type CustomerFormValues = z.infer<typeof customerSchema>;
type CardFormValues = z.infer<typeof CardSchema>;

const ITEMS_PER_PAGE = 8

export default function MainTable() {
    const { toast } = useToast()

    const { data: session } = useSession();
    const [dados, setDados] = useState<Customer[]>([]);
    const [pesquisa, setPesquisa] = useState("")
    const [filtroNome, setFiltroNome] = useState("")
    const [filtroCategoria, setFiltroCategoria] = useState("")
    const [ordenacao, setOrdenacao] = useState<{ coluna: keyof Customer; direcao: 'asc' | 'desc' }>({ coluna: 'name', direcao: 'asc' })
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1)


    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const {
        register,
        handleSubmit,
        reset, watch, control,
        setValue,
        formState: { errors },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
    });

    const {
        register: registerCard,
        handleSubmit: handleSubmitCard,
        reset: resetCard,
        setValue: setValueCard,
        formState: { errors: cardErrors },
    } = useForm<CardFormValues>({
        resolver: zodResolver(CardSchema),
    });

    const [cepError, setCepError] = useState("");

    const onSubmit = async (data: CustomerFormValues) => {
        if (!session || !session.user?.email) {
            console.error('Usuário não autenticado ou e-mail não encontrado.');
            return;
        }

        try {
            customerSchema.parse(data);

            const response = await fetch(`/api/customers?userEmail=${session?.user?.email}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    lastname: data.lastname,
                    email: data.email,
                    birthdate: data.birthDate,
                    phone: data.phone,
                    address: data.address,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao adicionar o cliente: ${errorData.error || response.statusText}`);
            }

            setDialogOpen(false)
            fetchData();
            reset();
            toast({
                variant: "success",
                title: "Cliente adicionado com sucesso!",
                description: "O cliente foi adicionado com sucesso.",
            })

            console.log('Cliente adicionado com sucesso!', response)


        } catch (error) {
            toast({
                variant: "destructive",
                title: "Não foi possível adicionar o cliente!",
                description: "Por favor verifique se o email já está cadastrado.",
            });
        }
    };

    const onSubmitCard = async (id: number, data: CardFormValues) => {
        try {
            console.log("ID do cliente:", id);
            console.log("Dados do cartão:", data);

            const response = await fetch(`/api/cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerId: id,
                    cardData: data,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao criar o cartão.");
            }

            const result = await response.json();
            console.log("Cartão criado com sucesso:", result);

            toast({
                variant: "success",
                title: "Cartão Criado!",
                description: "O cartão foi adicionado com sucesso ao cliente.",
            });
            resetCard();
            fetchData()
        } catch (error: any) {
            console.error("Erro ao criar o cartão:", error.message);
            toast({
                variant: "destructive",
                title: "Não foi possível adicionar o cartão!",
                description: "Por favor verifique se este número do cartão já está cadastrado",
            });
        }
    };


    const handleUpdateClick = (cliente: Customer) => {
        setSelectedCustomer(cliente);
        setDialogOpen(true);

        setValue("name", cliente.name);
        setValue("lastname", cliente.lastname || "");
        setValue("email", cliente.email);
        setValue("birthDate", new Date(cliente.birthDate));
        setValue("phone", cliente.phone);
        setValue("address", cliente.address);
    };

    const onSubmitUpdate = async (data: CustomerFormValues) => {
        if (!selectedCustomer) return;

        try {
            const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar o cliente');
            }

            toast({
                variant: "success",
                title: "Cliente atualizado com sucesso!",
                description: "O cliente foi atualizado com sucesso.",
            });

            setDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error('Erro ao atualizar o cliente:', error);
            toast({
                variant: "destructive",
                title: "Erro!",
                description: "Não foi possível atualizar o cliente.",
            });
        }
    };



    useEffect(() => {
        if (session?.user?.email) {
            fetchData();
        }
    }, [session]);

    const fetchAddress = async (cep: string) => {

        if (cep.length !== 9) {
            toast({
                variant: "destructive",
                title: "Ops, algo deu errado!",
                description: "Por favor, digite um CEP com 9 caracteres.",

            })
            return;
        }

        try {
            setCepError("");
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

            if (!response.ok) {
                console.log("CEP não encontrado.");
                setCepError("CEP não encontrado.");
                return;
            }

            const data = await response.json();

            if (data.erro) {
                toast({
                    variant: "destructive",
                    title: "Ops, algo deu errado!",
                    description: "CEP não encontrado.",

                })
                return;
            }

            setValue("address", `${data.logradouro}, ${data.bairro} - ${data.localidade} - ${data.uf} - CEP: ${data.cep}`);
            toast({
                variant: "success",
                title: "Agora foi!",
                description: "CEP encontrado com sucesso!.",

            })
        } catch (error) {
            console.log("Erro ao buscar o CEP.", error);
            setCepError("Erro ao buscar o CEP.");
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/customers?email=${session?.user?.email}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();



            const fetchedCustomers = data.map((cliente: any) => ({
                id: cliente.id,
                name: cliente.name,
                lastname: cliente.lastname,
                email: cliente.email,
                birthDate: cliente.birthdate,
                address: cliente.address,
                phone: cliente.phone,
                cards: cliente.cards.map((card: any) => ({
                    id: card.id,
                    number: card.number,
                    valiDate: card.valiDate,
                    cvv: card.cvv
                }))
            }));

            setDados(fetchedCustomers);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (customerId: number) => {
        try {

            const response = await fetch(`/api/customers?customerId=${customerId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir cliente');
            }

            const data = await response.json();
            toast({
                variant: "success",
                title: "Cliente excluído com sucesso!",
                description: `Cliente excluído com sucesso: ${data.customer.name}`,
            })
            fetchData()

        } catch (error) {
            console.error(error);
            alert('Falha ao excluir cliente');
        }
    };

    const handleDeleteCard = async (cardId: number) => {

        console.log("Excluindo cartão com ID:", cardId)

        try {
            const response = await fetch(`/api/cards?cardId=${cardId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir cartão');
            }

            const data = await response.json();
            toast({
                variant: "success",
                title: "Cartão excluído com sucesso!",
                description: `Cartão excluído com sucesso: ${data.card.id}`,
            });

            fetchData();

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Falha ao excluir cartão",
                description: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    };


    const dadosFiltrados = useMemo(() => {
        return dados
            .filter(cliente =>
                (pesquisa === "" || (
                    (cliente.name && cliente.name.toLowerCase().includes(pesquisa.toLowerCase())) ||
                    (cliente.lastname && cliente.lastname.toLowerCase().includes(pesquisa.toLowerCase())) ||
                    (cliente.email && cliente.email.toLowerCase().includes(pesquisa.toLowerCase()))
                )) &&
                (filtroNome === "" || (cliente.name && cliente.name === filtroNome)) &&
                (filtroCategoria === "" || (cliente.address && cliente.address.includes(filtroCategoria)))
            )
            .sort((a, b) => {
                if (ordenacao.coluna === 'birthDate') {
                    return ordenacao.direcao === 'asc'
                        ? new Date(a.birthDate || 0).getTime() - new Date(b.birthDate || 0).getTime()
                        : new Date(b.birthDate || 0).getTime() - new Date(a.birthDate || 0).getTime();
                }
                if (ordenacao.coluna === 'name' || ordenacao.coluna === 'lastname' || ordenacao.coluna === 'email') {
                    return ordenacao.direcao === 'asc'
                        ? (a[ordenacao.coluna] || "").localeCompare(b[ordenacao.coluna] || "")
                        : (b[ordenacao.coluna] || "").localeCompare(a[ordenacao.coluna] || "");
                }
                return 0;
            });
    }, [pesquisa, filtroNome, filtroCategoria, ordenacao, dados]);

    const totalPages = Math.ceil(dadosFiltrados.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentData = dadosFiltrados.slice(startIndex, endIndex)

    const toggleOrdenacao = (coluna: keyof Customer) => {
        setOrdenacao(prev => ({
            coluna,
            direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc'
        }))
    }




    return (
        <div className="space-y-4 pt-10 w-full">
            <div className='max-w-[1500px]  mx-auto px-4 sm:px-6 lg:px-8 mb-20'>
                <div className='pb-4'>
                    <h1 className="text-3xl font-bold">Clientes Cadastrados</h1>
                </div>
                <div className='flex gap-2 p-4 items-center '>
                    <div className='max-w-[600px] w-full'>
                        <Input
                            placeholder="Pesquisar..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className='max-w-[600px] '
                        />
                    </div>
                    <div className="flex space-x-2">



                        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger className='bg-black flex items-center justify-center text-[12px] sm:text-[14px] text-white font-semibold min-w-[100px] px-4 py-2 rounded-md'>
                                Adicionar Cliente <FiPlus className='min-w-[14px] min-h-[14px]' />
                            </DialogTrigger>
                            <DialogContent className='min-w-[900px] min-h-[400px]'>
                                <DialogHeader>
                                    <DialogTitle className='text-[20px] font-bold pb-4'>Deseja Adicionar um novo Cliente?</DialogTitle>
                                    <DialogDescription>
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name" className="block font-medium text-gray-700">
                                                        Nome
                                                    </label>
                                                    <Input
                                                        id="name"
                                                        placeholder="Digite o nome do Cliente"
                                                        type="text"
                                                        {...register("name")}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="lastname" className="block font-medium text-gray-700">
                                                        Sobrenome
                                                    </label>
                                                    <Input
                                                        id="lastname"
                                                        placeholder="Digite o sobrenome do Cliente"
                                                        type="text"
                                                        {...register("lastname")}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.lastname && <p className="text-red-500">{errors.lastname.message}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <div className=''>
                                                    <label htmlFor="email" className="block font-medium text-gray-700">
                                                        Email
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        placeholder="Digite o e-mail do Cliente"
                                                        type="text"
                                                        {...register("email")}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <label htmlFor="email" className="block font-medium text-gray-700">
                                                        CEP
                                                    </label>
                                                    <div>
                                                        <Input
                                                            id="cep"
                                                            placeholder="Digite o CEP do cliente"
                                                            type="text"

                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />

                                                        <div className='flex justify-end'>
                                                            <label
                                                                htmlFor="cep"
                                                                className="text-blue-500 underline mt-1 cursor-pointer block"
                                                                onClick={(e) => fetchAddress((document.getElementById('cep') as HTMLInputElement).value)}
                                                            >
                                                                Buscar CEP
                                                            </label>
                                                        </div>
                                                    </div>

                                                </div>
                                                <div>
                                                    <label htmlFor="address" className="block font-medium text-gray-700">
                                                        Endereço
                                                    </label>
                                                    <Input
                                                        id="address"
                                                        placeholder="Digite o endereço do Cliente"
                                                        type="text"
                                                        readOnly

                                                        {...register("address")}
                                                        className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.address && <p className="text-red-500">{errors.address.message}</p>}
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <label htmlFor="phone" className="block font-medium text-gray-700">
                                                        Telefone
                                                    </label>
                                                    <Controller
                                                        name="phone"
                                                        control={control}
                                                        defaultValue=""
                                                        render={({ field }) => (
                                                            <InputMask
                                                                {...field}
                                                                mask="(99) 99999-9999"
                                                                placeholder="Digite o telefone do Cliente"
                                                                className="mt-1 block min-h-[37px] w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-indigo-500 text-base" // Adicione text-base para aumentar o tamanho do texto
                                                                style={{ padding: '0.5rem', width: '100%' }}
                                                            />
                                                        )}
                                                    />
                                                    {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="birthDate" className="block font-medium text-gray-700">
                                                        Data de Nascimento
                                                    </label>
                                                    <Input
                                                        id="birthDate"
                                                        type="date"
                                                        {...register("birthDate", { valueAsDate: true })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.birthDate && (
                                                        <p className="text-red-500">{errors.birthDate.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md shadow-sm hover:bg-indigo-600"
                                            >
                                                Adicionar Cliente
                                            </button>
                                        </form>

                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                {isLoading ? (
                    <div className='flex items-center justify-center mt-40'>
                        <p><FontAwesomeIcon icon={faSpinner} spinPulse className='mb-6 min-w-[30px] min-h-[30px]' /></p>
                    </div>
                ) : (
                    <Table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <TableHeader className="bg-gray-200 hidden md:table-header-group">
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => toggleOrdenacao('name')}>
                                        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost">
                                        Email
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost">
                                        Data de Nascimento
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost">
                                        Endereço
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost">
                                        Telefone
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost">
                                        Cartões
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost">
                                        Ações
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.length === 0 ? ( // Verifica se o currentData está vazio
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">
                                        <p>Nenhum cliente encontrado.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentData.map((cliente, index) => (
                                    <TableRow key={index} className="block md:table-row">
                                        <TableCell className="block md:table-cell">
                                            <span className="font-semibold md:hidden">Nome: </span>{cliente.name}
                                        </TableCell>
                                        <TableCell className="block md:table-cell">
                                            <span className="font-semibold md:hidden">Email: </span>{cliente.email}
                                        </TableCell>
                                        <TableCell className="block md:table-cell">
                                            <span className="font-semibold md:hidden">Data de Nascimento: </span>
                                            {cliente.birthDate ? new Date(cliente.birthDate).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell className="block md:table-cell">
                                            <span className="font-semibold md:hidden">Endereço: </span>{cliente.address}
                                        </TableCell>
                                        <TableCell className="block md:table-cell">
                                            <span className="font-semibold md:hidden">Telefone: </span>{cliente.phone}
                                        </TableCell>
                                        <TableCell className="block md:table-cell">
                                            <span className="font-semibold md:hidden">Cartões: </span>
                                            <Drawer>
                                                <DrawerTrigger>
                                                    {cliente.cards && Array.isArray(cliente.cards) && cliente.cards.length > 0 ? (
                                                        <div className='bg-black text-white px-2 py-1 rounded hover:bg-white hover:text-black hover:border hover:border-black'>
                                                            <p className='inline-flex items-center gap-1'>{cliente.cards.length} <FaRegCreditCard className='w-5 h-5' /></p>
                                                        </div>
                                                    ) : (
                                                        "Nenhum cartão cadastrado"
                                                    )}
                                                </DrawerTrigger>
                                                <DrawerContent>
                                                    <DrawerHeader>
                                                        <DrawerTitle>Cartões Cadastrados em {cliente.name}</DrawerTitle>
                                                        <DrawerDescription>
                                                            <div className="space-y-4 max-h-[200px] overflow-y-auto max-w-[600px]">
                                                                {cliente.cards && Array.isArray(cliente.cards) && cliente.cards.length > 0 ? (
                                                                    <Accordion type="single" collapsible className='bg-gray-100 max-w-[600px]'>
                                                                        {cliente.cards.map((card, index) => (
                                                                            <AccordionItem key={index} value={`item-${index}`}>
                                                                                <AccordionTrigger>
                                                                                    <div className="flex items-center justify-between w-full">
                                                                                        <p className="font-medium pl-2">Cartão terminado em {card.number.slice(-4)}</p>
                                                                                    </div>
                                                                                </AccordionTrigger>
                                                                                <AccordionContent>
                                                                                    <div className="space-y-2 pl-2">
                                                                                        <p><strong>Número do Cartão:</strong> {card.number}</p>
                                                                                        <p><strong>Titular:</strong> {cliente.name}</p>
                                                                                        <p><strong>Expira em:</strong> {card.valiDate}</p>
                                                                                        <div>
                                                                                            <Button
                                                                                                className='bg-red-500 hover:bg-red-600 text-white hover-text-white px-4 py-2 rounded'
                                                                                                variant="destructive"
                                                                                                onClick={() => handleDeleteCard(card.id)}
                                                                                            >
                                                                                                Excluir Cartão
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </AccordionContent>
                                                                            </AccordionItem>
                                                                        ))}
                                                                    </Accordion>
                                                                ) : (
                                                                    <p>Nenhum cartão cadastrado</p>
                                                                )}
                                                            </div>
                                                        </DrawerDescription>
                                                    </DrawerHeader>
                                                    <DrawerFooter>
                                                        <DrawerClose>
                                                            <Button variant="outline">Cancel</Button>
                                                        </DrawerClose>
                                                    </DrawerFooter>
                                                </DrawerContent>
                                            </Drawer>
                                        </TableCell>
                                        <TableCell className="block md:table-cell">
                                            <span className="font-semibold md:hidden">Ações: </span>
                                            <Popover>
                                                <PopoverTrigger>
                                                    <CiMenuKebab />
                                                </PopoverTrigger>
                                                <PopoverContent className="flex flex-col gap-2 max-w-[200px]">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                className='bg-blue-500 hover:bg-blue-600 text-white hover-text-white px-4 py-2 rounded'
                                                                variant="outline"
                                                            >
                                                                Adicionar Cartão <FaRegCreditCard />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Adicionar um novo cartão ao cliente?<span className='underline'>{cliente.name}</span></DialogTitle>
                                                                <DialogDescription>
                                                                    Anyone who has this link will be able to view this.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div>
                                                                <form className='flex flex-col gap-4' onSubmit={handleSubmitCard((data) => onSubmitCard(cliente.id, data))}>
                                                                    <div>
                                                                        <Label>Insira o número do cartão</Label>
                                                                        <Input
                                                                            {...registerCard("number", {
                                                                                onChange: (e) => {
                                                                                    let value = e.target.value.replace(/\D/g, "");
                                                                                    if (value.length > 16) value = value.slice(0, 16);
                                                                                    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                                                                                    setValueCard("number", value.trim());
                                                                                }
                                                                            })}
                                                                            maxLength={19}
                                                                            placeholder="xxxx xxxx xxxx xxxx"
                                                                        />
                                                                        {cardErrors.number && <p className='text-red-500 text-sm'>{cardErrors.number.message}</p>}
                                                                    </div>
                                                                    <div className='grid grid-cols-2 gap-4'>
                                                                        <div className='max-w-[200px]'>
                                                                            <Label>Insira o código de segurança</Label>
                                                                            <Input
                                                                                maxLength={3}
                                                                                {...registerCard("cvv")}
                                                                                placeholder="CVV"
                                                                            />
                                                                            {cardErrors.cvv && <p className='text-red-500 text-sm'>{cardErrors.cvv.message}</p>}
                                                                        </div>
                                                                        <div>
                                                                            <Label>Insira a Data de Validade</Label>
                                                                            <Input
                                                                                {...registerCard("valiDate", {
                                                                                    onChange: (e) => {
                                                                                        let value = e.target.value;
                                                                                        value = value.replace(/[^0-9/]/g, "");
                                                                                        if (value.length > 5) value = value.slice(0, 5);

                                                                                        if (value.length === 2 && !value.includes("/")) {
                                                                                            value = `${value}/`;
                                                                                        }
                                                                                        setValueCard("valiDate", value);
                                                                                    },
                                                                                })}
                                                                                maxLength={5}
                                                                                placeholder="MM/AA"
                                                                            />
                                                                            {cardErrors.valiDate && (
                                                                                <p className='text-red-500 text-sm'>
                                                                                    {cardErrors.valiDate.message === "A data de validade deve estar no formato MM/AA, com o mês entre 01 e 12 e o ano entre 25 e 35."
                                                                                        ? "A data de validade deve estar no formato MM/AA, com o mês entre 01 e 12 e o ano entre 25 e 35."
                                                                                        : cardErrors.valiDate.message}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex justify-end mt-4'>
                                                                        <Button
                                                                            type="submit"
                                                                            className='bg-blue-500 hover:bg-blue-600 text-white hover-text-white px-4 py-2 rounded'
                                                                        >
                                                                            Adicionar Cartão
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                                                        <DialogTrigger
                                                            className='bg-black flex items-center justify-center text-[14px] text-white font-semibold min-w-[100px] px-4 py-2 rounded-md'
                                                            onClick={() => handleUpdateClick(cliente)}
                                                        >
                                                            Atualizar Cliente <GrUpdate className='ml-2' />
                                                        </DialogTrigger>
                                                        <DialogContent className='min-w-[900px] min-h-[400px]'>
                                                            <DialogHeader>
                                                                <DialogTitle className='text-[20px] font-bold pb-4'>
                                                                    Atualizar Cliente {selectedCustomer?.name}
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label htmlFor="name" className="block font-medium text-gray-700">
                                                                                    Nome
                                                                                </label>
                                                                                <Input
                                                                                    id="name"
                                                                                    placeholder="Digite o nome do Cliente"
                                                                                    type="text"
                                                                                    {...register("name")}
                                                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                                />
                                                                                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                                                                            </div>
                                                                            <div>
                                                                                <label htmlFor="lastname" className="block font-medium text-gray-700">
                                                                                    Sobrenome
                                                                                </label>
                                                                                <Input
                                                                                    id="lastname"
                                                                                    placeholder="Digite o sobrenome do Cliente"
                                                                                    type="text"
                                                                                    {...register("lastname")}
                                                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                                />
                                                                                {errors.lastname && <p className="text-red-500">{errors.lastname.message}</p>}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <label htmlFor="email" className="block font-medium text-gray-700">
                                                                                Email
                                                                            </label>
                                                                            <Input
                                                                                id="email"
                                                                                placeholder="Digite o e-mail do Cliente"
                                                                                type="text"
                                                                                {...register("email")}
                                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                            />
                                                                            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                                                                        </div>
                                                                        <div className='grid grid-cols-2 gap-4'>
                                                                            <div>
                                                                                <label htmlFor="cep" className="block font-medium text-gray-700">
                                                                                    CEP
                                                                                </label>
                                                                                <Input
                                                                                    id="cep"
                                                                                    placeholder="Digite o CEP do cliente"
                                                                                    type="text"
                                                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                                />
                                                                                <div className='flex justify-end'>
                                                                                    <label
                                                                                        htmlFor="cep"
                                                                                        className="text-blue-500 underline mt-1 cursor-pointer block"
                                                                                        onClick={(e) => fetchAddress((document.getElementById('cep') as HTMLInputElement).value)}
                                                                                    >
                                                                                        Buscar CEP
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <label htmlFor="address" className="block font-medium text-gray-700">
                                                                                    Endereço
                                                                                </label>
                                                                                <Input
                                                                                    id="address"
                                                                                    placeholder="Digite o endereço do Cliente"
                                                                                    type="text"
                                                                                    readOnly
                                                                                    {...register("address")}
                                                                                    className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                                />
                                                                                {errors.address && <p className="text-red-500">{errors.address.message}</p>}
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-2 gap-4'>
                                                                            <div>
                                                                                <label htmlFor="phone" className="block font-medium text-gray-700">
                                                                                    Telefone
                                                                                </label>
                                                                                <Controller
                                                                                    name="phone"
                                                                                    control={control}
                                                                                    defaultValue=""
                                                                                    render={({ field }) => (
                                                                                        <InputMask
                                                                                            {...field}
                                                                                            mask="(99) 99999-9999"
                                                                                            placeholder="Digite o telefone do Cliente"
                                                                                            className="mt-1 block min-h-[37px] w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-indigo-500 text-base"
                                                                                            style={{ padding: '0.5rem', width: '100%' }}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                                {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
                                                                            </div>
                                                                            <div>
                                                                                <label htmlFor="birthDate" className="block font-medium text-gray-700">
                                                                                    Data de Nascimento
                                                                                </label>
                                                                                <Input
                                                                                    id="birthDate"
                                                                                    type="date"
                                                                                    {...register("birthDate", { valueAsDate: true })}
                                                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                                />
                                                                                {errors.birthDate && (
                                                                                    <p className="text-red-500">{errors.birthDate.message}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="submit"
                                                                            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md shadow-sm hover:bg-indigo-600"
                                                                        >
                                                                            Atualizar Cliente
                                                                        </button>
                                                                    </form>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button
                                                        className='bg-red-500 hover:bg-red-600 text-white hover-text-white px-4 py-2 rounded'
                                                        onClick={() => handleDelete(cliente.id)}
                                                    >
                                                        Excluir Cliente <FaTrashCan />
                                                    </Button>
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}

            </div>
            <Pagination className=''>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }}
                        />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink
                                href="#"
                                isActive={currentPage === index + 1}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage(index + 1)
                                }}
                            >
                                {index + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

